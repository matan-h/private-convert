import React, { useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import "./App.css";
import ffmpegCls from "./utils/FFmpegCls";
import { ConvertOptions, getByMimeType } from "./utils/convertOptionsFull";
import { JSX } from "react/jsx-runtime";
import DotProgressBar from "./components/DotProgressBar";
import PreviewComponent from "./components/previewCard";
import { createZipFile } from "./utils/ZipCreator";
import StickyButton from "./components/StickyButton";
import LogsView from "./components/LogsView";

enum Screen {
    UPLOAD,
    PREVIEW,
    CONVERTING,
    CONVERTED,
}

const App: React.FC = () => {
    const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.UPLOAD);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [conversionProgress, setConversionProgress] = useState<number>(0);
    const [currentFileIndex, setCurrentFileIndex] = useState<number>(0);
    const [currentConvertingFileIndex, setCurrentConvertingFileIndex] =
        useState<number>(0);
    const [ffmpegInstance, setFFmpegInstance] = useState<ffmpegCls | null>(
        null
    );
    const [outputFiles, setOutputFiles] = useState<File[]>([]);
    const convertDropdown = useRef<HTMLSelectElement>(null);
    const ProgressBarRef = useRef<HTMLProgressElement>(null);
    const [outputURI, setOutputURI] = useState<string>("");

    const [logs, setLogs] = useState<string[]>([]);
    const [showLogs, setShowLogs] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [postFFmpegInstance, setpostFFmpegInstance] = useState<Function | null>(null);

    useEffect(() => {
        const initFFmpeg = async () => {
            const instance = new ffmpegCls();
            console.log("loading ffmpeg")
            await instance.load();
            setFFmpegInstance(instance);
            console.log("ffmpeg instance loaded")
            if (postFFmpegInstance) { postFFmpegInstance() }

        };
        try {
            initFFmpeg();
        }
        catch (e) {
            setErrorMessage(String(e))
            alert(e)
        }
    }, []);

    const handleFileUpload = (acceptedFiles: File[]) => {
        setSelectedFiles(acceptedFiles);
        // setTimeout(() => setCurrentScreen(Screen.PREVIEW), 4000)
        if (ffmpegInstance) {
            setCurrentScreen(Screen.PREVIEW);
        }
        else {
            console.log("no ffmpeg instance, using setpostFFmpegInstance")
            setpostFFmpegInstance(() => { setCurrentScreen(Screen.PREVIEW) })
        }
    };

    const { getRootProps, getInputProps } = useDropzone({
        accept: { "image/gif": [], "video/*": [], "audio/*": [], "image/*": [] },
        onDrop: handleFileUpload,
    });

    const handleConvert = async () => {
        setCurrentScreen(Screen.CONVERTING);
        console.log(`resetting outputFiles from [${outputFiles}] to []`);
        setOutputFiles([]);
        if (ffmpegInstance) {
            const output_ext =
                convertDropdown.current!.selectedOptions[0].value;
            interface progressOBJ {
                progress: number;
                time: number;
            }

            const onProgress = function onProgress(progress_obj: progressOBJ) {
                if (progress_obj.progress > 1000) { return } // sometimes happend to ffmpeg.wasm
                const progress = progress_obj.progress * 100;
                console.log("ffmpeg.wasm::progress:", progress);
                setConversionProgress(progress);
            };
            ffmpegInstance.on("progress", onProgress);
            ffmpegInstance.on("log", ({ message, type }: any) => {
                console.log(`[${type}]:${message}`);
                setLogs(prevlogs => [...prevlogs, message])
            });
            const mimetype: string = ConvertOptions[output_ext].mimetype; // the first in the list is the default
            const newOutputFiles = [];
            const verifyFFmpegWorking = () => { // we cannot use progress value here since react save the state, so it always be zero
                if (ProgressBarRef.current?.value === 0) { const s = ("ffmpeg not returning any progress in 6 seconds. maybe your browser killed it"); setErrorMessage(s) }
            }

            for (const [i, inputFile] of selectedFiles.entries()) {
                const output_fname =
                    inputFile.name.substring(
                        0,
                        inputFile.name.lastIndexOf(".")
                    ) || inputFile.name;
                const outputFilePath = `${output_fname}.${output_ext}`;

                setCurrentConvertingFileIndex(i);
                setConversionProgress(0); // always start with 0
                const inputFilePath = URL.createObjectURL(inputFile);
                var it = setTimeout(verifyFFmpegWorking, 8000) // 8 seconds after exec should be enough for FFmpeg to start
                var outFile: File;
                try {
                    outFile = await ffmpegInstance.exec(
                        inputFile.name,
                        mimetype,

                        inputFilePath,
                        outputFilePath,
                        [] // TODO: use the ffmpeg arguments
                    );
                }
                catch (e) {
                    setErrorMessage("ffmpeg FileSystem error: look at the logs, or at the convertion process (Make sure that it makes sense.)")
                    continue;
                }
                clearTimeout(it)
                newOutputFiles.push(outFile);
            }
            setOutputFiles(newOutputFiles);
            setCurrentScreen(Screen.CONVERTED);
        } else {
            let issharedarray = typeof SharedArrayBuffer !== 'undefined'
            const err = "an fatal error happened: no ffmpeg instance found - please reload or open f12 and report." + (issharedarray ? "" : " (SharedArrayBuffer is defined)");
            setLogs(prevlogs => [...prevlogs, err])
            setErrorMessage(err);
        }
    };

    const handleReset = () => {
        setSelectedFiles([]);
        setConversionProgress(0);
        setCurrentScreen(Screen.UPLOAD);
        setErrorMessage(null);
    };

    function renderScreen() {
        switch (currentScreen) {
            case Screen.UPLOAD:
                return (
                    <div className="full-screen">
                        <div className="upload-area" {...getRootProps()}>
                            <input {...getInputProps()} />
                            <p className="upload-text">
                                Drag files here or click here to upload files
                            </p>
                        </div>
                    </div>
                );

            case Screen.PREVIEW:
                console.log(selectedFiles);

                const uploadedFileTypes = selectedFiles.map(
                    (file) => file.type
                );
                const uploadedFileExt = most(
                    selectedFiles.map(
                        (file) => file.name.split(".").pop() || ""
                    )
                );
                var fileConvertOptions =
                    getByMimeType(
                        most(uploadedFileTypes.slice()) || "",
                        uploadedFileExt
                    ) || null;
                var options: JSX.Element[] = [];
                var top_option = undefined;
                var top_counter = 0;

                if (fileConvertOptions) {
                    console.log(fileConvertOptions.optional_convert_routes);
                    for (const key in fileConvertOptions.optional_convert_routes) {
                        if (key === uploadedFileExt) {
                            continue; // do not display the option to convert format to itself
                        }

                        let full_value = ConvertOptions[key];
                        if (!full_value) { // is a convertion option but not a convert-to option. skip it for now
                            continue
                        }
                        if (full_value.useful > top_counter) {
                            top_counter = full_value.useful;
                            top_option = key;
                        }
                        options.push(
                            <option value={key} key={key}>
                                {key} ({full_value.full_string})
                            </option>
                        );
                    }
                } else {
                    options = [<option value="error">error</option>];
                    console.error("cannot find options for this format:", most(uploadedFileTypes.slice()) || uploadedFileTypes)
                    if (uploadedFileTypes.length === 0) {
                        return <>
                            <blockquote><p>cannot find uploaded file. please try again</p></blockquote>
                            <button
                                className="action-button reset-button"
                                onClick={handleReset}>
                                Reset
                            </button></>

                    }
                    else {
                        return <>
                            <blockquote className="error-message"><p>the website does not support convertion from {most(uploadedFileTypes.slice()) || uploadedFileTypes} format yet</p> </blockquote>
                            <button
                                className="action-button reset-button"
                                onClick={handleReset}>
                                Reset
                            </button>
                        </>

                    }
                }

                return (
                    <div className="content">
                        {PreviewComponent(
                            selectedFiles,
                            currentFileIndex,
                            setCurrentFileIndex
                        )}
                        <div className="convert-dropdown">
                            <label htmlFor="convertTo">Convert to:</label>
                            <select
                                id="convertTo"
                                className="dropdown"
                                ref={convertDropdown}
                                defaultValue={top_option}
                            >
                                {options}
                            </select>
                        </div>

                        <div className="button-group">
                            <button
                                className="action-button reset-button"
                                onClick={handleReset}
                            >
                                Reset
                            </button>
                            <button
                                className="action-button convert-button"
                                onClick={handleConvert}
                            >
                                Convert
                            </button>
                        </div>
                    </div>
                );

            case Screen.CONVERTING:
                return (
                    <>
                        <StickyButton onClick={() => setShowLogs(true)} /><div className="content">
                            {showLogs && <LogsView logs={logs} onClose={() => setShowLogs(false)} />}

                            <p>
                                Converting...{" "}
                                {selectedFiles.length > 1 && (
                                    <span>
                                        ({currentConvertingFileIndex + 1} of{" "}
                                        {selectedFiles.length})
                                    </span>
                                )}
                            </p>
                            {selectedFiles.length > 1 && (
                                <>
                                    <p>
                                        Converting file{" "}
                                        <code>
                                            {selectedFiles[currentConvertingFileIndex].name}
                                        </code>
                                    </p>
                                    <DotProgressBar
                                        progress={currentConvertingFileIndex + 1}
                                        totalFiles={selectedFiles.length}
                                    ></DotProgressBar>
                                </>
                            )}
                            <progress
                                className="progress-bar"
                                value={conversionProgress}
                                ref={ProgressBarRef}
                                max={100} />
                            {errorMessage && <><blockquote className="error-message"><p>{errorMessage}</p></blockquote>
                                <button
                                    className="action-button reset-button"
                                    onClick={handleReset}>
                                    Reset
                                </button>
                            </>}
                        </div>
                    </>
                );

            case Screen.CONVERTED:
                if (!outputFiles.length) {
                    // if is not empty
                    return <div className="no-output-container">
                        <blockquote className="error-message"><p>get error from ffmpeg. check logs:</p></blockquote><br></br>
                        {/* <StickyButton onClick={() => setShowLogs(true)} /> */}
                        {/* {showLogs && <LogsView logs={logs} onClose={() => setShowLogs(false)} />} */}
                        <div className="logs-embed">
                        <pre>
                            {logs.map((log, index) => (
                                <p key={index} className={(log === "Aborted()" && "ffend") || undefined}>{log}</p>
                            ))}
                        </pre>
                        </div>
                        <button
                            className="action-button reset-button"
                            onClick={handleReset}>
                            Reset
                        </button>

                    </div>;
                }
                var singleURI: string = "";
                if (outputFiles.length > 1 && !outputURI) {
                    const fullCreateZip = async () => {
                        const zipBlob = await createZipFile(
                            outputFiles,
                            `converted using private-convert`
                        );
                        setOutputURI(URL.createObjectURL(zipBlob));
                    };
                    fullCreateZip();
                } else {
                    singleURI = URL.createObjectURL(outputFiles[0]);
                }
                // const outputURI = URL.createObjectURL(outputFiles[0]);
                console.log("get URI:", outputURI || singleURI);
                console.log("output Files:", outputFiles, currentFileIndex);
                var download_btn_text;
                var download_filename;
                if (outputFiles.length > 1) {
                    download_filename = "converted.zip"; //? converted-to-${format}
                } else {
                    download_filename = outputFiles[0].name;
                }
                if ((outputURI || singleURI) === "") {
                    download_btn_text = <code>building zip file</code>;
                } else {
                    download_btn_text = (
                        <>Download {outputFiles.length > 1 && <>(zip)</>}</>
                    );
                }
                return (
                    <>
                        <StickyButton onClick={() => setShowLogs(true)} />
                        {showLogs && <LogsView logs={logs} onClose={() => setShowLogs(false)} />}
                        <div className="content">
                            {PreviewComponent(
                                outputFiles,
                                currentFileIndex,
                                setCurrentFileIndex
                            )}

                            <a
                                className="action-button convert-button download-button"
                                download={download_filename}
                                href={(outputURI || singleURI) + "#" + download_filename}
                            >
                                {download_btn_text}
                            </a>
                        </div></>
                );

            default:
                return null;
        }
    }

    return <div className="app">{renderScreen()}</div>;
};

export default App;
/**
 * Get the element with the highest occurrence in an array
 * from so:1053843
 * @param arr - the array
 * @returns - the element with the highest occurrence (the last if no one)
 */
function most(arr: string[]): string | undefined {
    return arr
        .sort(
            (a: string, b: string) =>
                arr.filter((v: string) => v === a).length -
                arr.filter((v: string) => v === b).length
        )
        .pop();
}

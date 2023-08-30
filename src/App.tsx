import React, { useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import "./App.css";
import ffmpegCls from "./utils/FFmpegCls";
import { ConvertOptions, getByMimeType } from "./utils/convertOptionsFull";
import { JSX } from "react/jsx-runtime";
import DotProgressBar from "./components/DotProgressBar";
import PreviewComponent from "./components/previewCard";

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
    const [currentConvertingFileIndex, setCurrentConvertingFileIndex] = useState<number>(0);
    const [ffmpegInstance, setFFmpegInstance] = useState<ffmpegCls | null>(
        null
    );
    const [outputFiles, setOutputFiles] = useState<File[]>([]);
    const convertDropdown = useRef<HTMLSelectElement>(null);

    useEffect(() => {
        const initFFmpeg = async () => {
            const instance = new ffmpegCls();
            await instance.load();
            setFFmpegInstance(instance);
        };
        initFFmpeg();
    }, []);

    const handleFileUpload = (acceptedFiles: File[]) => {
        setSelectedFiles(acceptedFiles);
        setCurrentScreen(Screen.PREVIEW);
    };

    const { getRootProps, getInputProps } = useDropzone({
        accept: { "image/gif": [], "video/*": [], "audio/*": [] }, // You can change the accepted file types
        onDrop: handleFileUpload,
    });

    const handleConvert = async () => {
        setCurrentScreen(Screen.CONVERTING);
        console.log(`resetting outputFiles from [${outputFiles}] to []`)
        setOutputFiles([]);
        if (ffmpegInstance) {
            const output_ext = convertDropdown.current!.selectedOptions[0].value
            // TODO : make the multiple files work
            interface progressOBJ {
                progress: number;
                time: number;
            }
            
            const onProgress = function onProgress(
                progress_obj: progressOBJ
            ) {
                const progress = progress_obj.progress * 100;
                console.log("ffmpeg.wasm::progress:", progress);
                setConversionProgress(progress);
            };
            ffmpegInstance.on("progress", onProgress);
            const mimetype: string =
                ConvertOptions[
                    output_ext
                ].mimetype;
            const newOutputFiles = [];
            for (const [i,inputFile] of selectedFiles.entries()) {
                const outputFilePath = `output${i}.${output_ext}`; // TODO : use the same filename at download and here

                setCurrentConvertingFileIndex(i)
                setConversionProgress(0) // always start with 0
                const inputFilePath = URL.createObjectURL(inputFile);
                const outFile =await ffmpegInstance.exec(
                        inputFile.name,
                        mimetype,

                        inputFilePath,
                        outputFilePath,
                        [] // TODO: use the ffmpeg arguments
                    )
                    newOutputFiles.push(outFile)
            }
            setOutputFiles(newOutputFiles)
            setCurrentScreen(Screen.CONVERTED);
        }
        else{
            alert("an fatal error happened: no ffmpeg instance found")
        }
    };

    const renderPreview = (file: string | null, type: string) => {
        if (!file) {
            return null;
        }

        if (type.startsWith("image")) {
            return <img src={file} alt="Preview" />;
        } else if (type.startsWith("audio")) {
            return <audio controls src={file} />;
        } else if (type.startsWith("video")) {
            return <video controls src={file} />;
        }

        return <p>Preview not available for this file type.</p>;
    };
    const trimFileName = (filename: string) => {
        const extension = filename.split(".").pop();
        const trimmedName = filename.substring(0, 5);
        return `${trimmedName}...${extension}`;
    };

    const handleReset = () => {
        setSelectedFiles([]);
        setConversionProgress(0);
        setCurrentScreen(Screen.UPLOAD);
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
                var top_option = undefined; // TODO : select the top option
                var top_counter = 0;

                if (fileConvertOptions) {
                    console.log(fileConvertOptions.optional_convert_routes);
                    for (const key in fileConvertOptions.optional_convert_routes) {
                        if (key === uploadedFileExt) {
                            continue; // do not display the option to convert format to itself
                        }

                        let full_value = ConvertOptions[key];
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
                }

                return (
                    <div className="content">
                        {/* Display preview card */}
                        {PreviewComponent(selectedFiles,currentFileIndex,setCurrentFileIndex)}
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
                    <div className="content">
                        <p>Converting... {selectedFiles.length>1 && <span>({currentConvertingFileIndex+1} of {selectedFiles.length})</span>}</p>
                        {selectedFiles.length > 1 && (
                            <><p>
                                Converting file <code>{selectedFiles[currentConvertingFileIndex].name}</code>
                            </p><DotProgressBar progress={currentConvertingFileIndex+1} totalFiles={selectedFiles.length}></DotProgressBar>
                            
                            </>

                        )}
                        <progress
                            className="progress-bar"
                            value={conversionProgress}
                            max={100}
                        />
                    </div>
                );

            case Screen.CONVERTED:
                if (!(outputFiles.length)) { // if is not empty
                    alert("no output from ffmpeg. check logs");debugger;
                    return;
                }
                
                const outputURI = URL.createObjectURL(outputFiles[0]);
                console.log("get URI:", outputURI);
                console.log("output Files:",outputFiles,currentFileIndex);
                return (
                    <div className="content">
                        {/* Display preview card */}
                        {/* <div className="preview-card">
                            {renderPreview(URL.createObjectURL(outputFiles[currentFileIndex]), outputFiles[currentFileIndex].type)}
                        </div> */}
                        {PreviewComponent(outputFiles,currentFileIndex,setCurrentFileIndex)}
                        {/* TODO: ConvertedFile should move to OutputBlob ....*/}

                        <a
                            className="action-button convert-button download-button"
                            download // TODO download=filename.{ext} or converted-to-{ext}.zip
                            href={outputURI}
                        >
                            Download {(outputFiles.length > 1 && <>(zip)</>)}
                        </a>
                    </div>
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
import React, { useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import "./App.css";
import ffmpegCls from "./FFmpegCls";
import { ConvertOptions, getByMimeType } from "./convertOptionsFull";
import { JSX } from "react/jsx-runtime";

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
  const [ffmpegInstance, setFFmpegInstance] = useState<ffmpegCls | null>(null);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
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

  const ProgressFinished = () => {
    setCurrentScreen(Screen.CONVERTED);
  };

  const handleConvert = async () => {
    setCurrentScreen(Screen.CONVERTING);
    if (ffmpegInstance) {
      for (const inputFile of selectedFiles) {
        const inputFilePath = URL.createObjectURL(inputFile);
        const outputFilePath = `output.${
          convertDropdown.current!.selectedOptions[0].value
        }`;
        interface progressOBJ {
          progress: number;
          time: number;
        }
        const onProgress = function onProgress(progress_obj: progressOBJ) {
          const progress = progress_obj.progress * 100;
          console.log("ffmpeg.wasm::progress:", progress);
          if (currentScreen === Screen.CONVERTING) {
            setConversionProgress(progress); // only rerender if there is progressbar
          }
        };
        ffmpegInstance.on("progress", onProgress);
        // const args = generateFFmpegArguments(inputFilePath, outputFilePath); // TODO : customizable FFmpegArguments
        const mimetype: string =
          ConvertOptions[convertDropdown.current!.selectedOptions[0].value]
            .mimetype;
        setOutputBlob(
          await ffmpegInstance.exec(
            inputFile.name,
            mimetype,

            inputFilePath,
            outputFilePath,
            [],
            ProgressFinished
          )
        );
      }
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
        const uploadedFileTypes = selectedFiles.map((file) => file.type);
        const uploadedFileExt = most(
          selectedFiles.map((file) => file.name.split(".").pop() || "")
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
            <div className="preview-card">
              {renderPreview(
                URL.createObjectURL(selectedFiles[currentFileIndex]),
                selectedFiles[currentFileIndex].type
              )}
            </div>

            {selectedFiles.length > 1 && (
              <div className="file-switcher">
                <p className="file-switcher-label">Switch File Preview:</p>
                <div className="file-switcher-buttons">
                  {selectedFiles.map((file, index) => (
                    <button
                      key={index}
                      className={`file-switcher-button ${
                        currentFileIndex === index ? "active" : ""
                      }`}
                      onClick={() => setCurrentFileIndex(index)}
                    >
                      {trimFileName(file.name)}
                    </button>
                  ))}
                </div>
              </div>
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
          <div className="content">
            <p>Converting...</p>
            <progress
              className="progress-bar"
              value={conversionProgress}
              max={100}
            />
          </div>
        );

      case Screen.CONVERTED:
        if (!outputBlob) {
          alert("no output from ffmpeg. check logs");
          return;
        }
        // TODO: why the preview reloading 5 times with different blob links ?
        const outputURI = URL.createObjectURL(outputBlob);
        console.log("get URI:", outputURI);
        return (
          <div className="content">
            {/* Display preview card */}
            <div className="preview-card">
              {renderPreview(outputURI, outputBlob.type)}
            </div>
            {/* TODO: ConvertedFile should move to OutputBlob ....*/}

            <a
              className="action-button convert-button"
              download
              href={outputURI}
            >
              Download
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

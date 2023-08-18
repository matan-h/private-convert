import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import "./App.css";
import { getConvertOptions } from "./convertOptions";
// import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from "@ffmpeg/util";
import ffmpegCls from "./FFmpegCls";
import { ConvertOptions } from "./convertOptionsFull";

enum Screen {
  UPLOAD,
  PREVIEW,
  CONVERTING,
  CONVERTED,
}

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.UPLOAD);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [convertedFile, setConvertedFile] = useState<File | null>(null);
  const [conversionProgress, setConversionProgress] = useState<number>(0);
  const [currentFileIndex, setCurrentFileIndex] = useState<number>(0);
  const [ffmpegInstance, setFFmpegInstance] = useState<ffmpegCls | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string>("error");
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);

  // const [ffmpegArguments, setFFmpegArguments] = useState<FFmpegArguments | null>(null); // TODO : make ffmpeg options customizeable

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
    setConvertedFile(selectedFiles[0] || null);
  };

  const handleConvert = async () => {
    setCurrentScreen(Screen.CONVERTING);
    if (ffmpegInstance) {
      for (const inputFile of selectedFiles) {
        const inputFilePath = URL.createObjectURL(inputFile);
        const outputFilePath = `output.${selectedFormat}`;
        interface progressOBJ {
          progress: number;
          time: number;
        }
        const onProgress = function onProgress(progress_obj: progressOBJ) {
          const progress = progress_obj.progress * 100;
          console.log("progress after:", progress);
          setConversionProgress(progress);
        };
        ffmpegInstance.on("progress", onProgress);
        // const args = generateFFmpegArguments(inputFilePath, outputFilePath); // TODO : customizeable FFmpegArguments
        setOutputBlob(
          await ffmpegInstance.exec(
            inputFile.name,
            inputFile.type,
            inputFilePath,
            outputFilePath,
            [],
            ProgressFinished
          )
        );
      }
    }

    simulateConversion();
  };

  const simulateConversion = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setConversionProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setCurrentScreen(Screen.CONVERTED);
        setConvertedFile(selectedFiles[0] || null); // that again is just a simulate
      }
    }, 500);
  };
  const renderPreview = (file: string | null, type: string) => {
    // URL.createObjectURL(file),file.type
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
    setConvertedFile(null);
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
        console.log("AAAuploadedFileTypes",selectedFiles)
        const uploadedFileTypes = selectedFiles.map((file) => file.type);
        console.log("BEFOREuploadedFileTypes",uploadedFileTypes,"||","most(uploadedFileTypes)",most(uploadedFileTypes.slice()))
        const fileConvertOptions =ConvertOptions[most(uploadedFileTypes.slice()) || ""]||null; // FIXME: most of the file types is mimetype not extention
        console.log("AFTERuploadedFileTypes",uploadedFileTypes,"||","most(uploadedFileTypes)",most(uploadedFileTypes.slice()))
        var options = [];
        if (fileConvertOptions){
        for (const key in fileConvertOptions.optional_convert_routes) {
          let value = fileConvertOptions.optional_convert_routes[key];
          let full_value = ConvertOptions[key]
          options.push(<option value={value} key={key}>{full_value.full_string}</option>) 
        }
        
          // (Object.entries(fileConvertOptions)).map((option, index) => (
            //   <option key={index} value={option.value}>
            //     {option.label}
            //   </option>
            // ))}

          
        }
        else{
          options = [<option value="error">error</option>]
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
                onChange={(e) => setSelectedFormat(e.target.value)}
                value={selectedFormat}
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

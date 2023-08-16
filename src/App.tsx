import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import "./App.css";

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
  const handleFileUpload = (acceptedFiles: File[]) => {
    setSelectedFiles(acceptedFiles);
    setCurrentScreen(Screen.PREVIEW);
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/gif": [], "video/*": [],"audio/*":[] }, // You can change the accepted file types
    onDrop: handleFileUpload,
    
  });

  const handleConvert = () => {
    setCurrentScreen(Screen.CONVERTING);
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
  const renderPreview = (file: File | null) => {
    if (!file) {
      return null;
    }

    if (file.type.startsWith("image")) {
      return <img src={URL.createObjectURL(file)} alt="Preview" />;
    } else if (file.type.startsWith("audio")) {
      return <audio controls src={URL.createObjectURL(file)} />;
    } else if (file.type.startsWith("video")) {
      return <video controls src={URL.createObjectURL(file)} />;
    }

    return <p>Preview not available for this file type.</p>;
  };

  const handleReset = () => {
    setSelectedFiles([]);
    setConvertedFile(null);
    setConversionProgress(0);
    setCurrentScreen(Screen.UPLOAD);
  };

  const renderScreen = () => {
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
        return (
          <div className="content">
            {/* Display preview card */}
            <div className="preview-card">
              {renderPreview(selectedFiles[0])}
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
        return (
          <div className="content">
            {/* Display preview card */}
            <div className="preview-card">{renderPreview(convertedFile)}</div>

            <button className="action-button convert-button">Download</button>
          </div>
        );

      default:
        return null;
    }
  };

  return <div className="app">{renderScreen()}</div>;
};

export default App;

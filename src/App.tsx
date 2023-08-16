import React, { useState } from 'react';
import './App.css'; // Import your CSS file

enum Screen {
  UPLOAD,
  PREVIEW,
  CONVERTING,
  CONVERTED
}

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.UPLOAD);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [convertedFile, setConvertedFile] = useState<File | null>(null);
  const [conversionProgress, setConversionProgress] = useState<number>(0);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedFiles(files);
      setCurrentScreen(Screen.PREVIEW);
      handleConvert();
    }
  };

  const handleConvert = () => {
    setCurrentScreen(Screen.CONVERTING);
    simulateConversion(); // Placeholder for actual conversion logic
  };

  const simulateConversion = () => {
    // Simulate conversion progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setConversionProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setCurrentScreen(Screen.CONVERTED);
        setConvertedFile(selectedFiles?.[0] || null);
      }
    }, 500);
  };

  const handleReset = () => {
    setSelectedFiles(null);
    setConvertedFile(null);
    setConversionProgress(0);
    setCurrentScreen(Screen.UPLOAD);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case Screen.UPLOAD:
        return (
          <div className="full-screen">
            <div className="upload-area">
              <p className="upload-text">Drag files here or click here to upload files</p>
              <input type="file" multiple onChange={handleFileUpload} />
            </div>
          </div>
        );

      case Screen.PREVIEW:
        return (
          <div className="content">
            {/* Display preview of uploaded files */}
            <select className="dropdown">
              {/* Dropdown for "convert to" options */}
            </select>
            <button className="action-button" onClick={handleReset}>Reset</button>
            <button className="action-button" onClick={handleConvert}>Convert</button>
          </div>
        );

      case Screen.CONVERTING:
        return (
          <div className="content">
            <p>Converting...</p>
            <progress className="progress-bar" value={conversionProgress} max={100} />
          </div>
        );

      case Screen.CONVERTED:
        return (
          <div className="content">
            {/* Display preview of the converted file */}
            <button className="action-button">Download</button>
          </div>
        );

      default:
        return null;
    }
  };

  return <div className="app">{renderScreen()}</div>;
};

export default App;

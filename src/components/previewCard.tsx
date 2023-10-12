const PreviewComponent = (selectedFiles: File[],currentFileIndex:number,setCurrentFileIndex:Function,blob:string|null=null) => {
  return (
    
    <>
      {selectedFiles.length > 1 && (<h4>{selectedFiles[currentFileIndex].name}</h4>)}
      <div className="preview-card">
        {renderPreview(
          blob||URL.createObjectURL(selectedFiles[currentFileIndex]),
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
    </>
  );
};
const trimFileName = (filename: string) => {
  const extension = filename.split(".").pop();
  const trimmedName = filename.substring(0, 5);
  return `${trimmedName}...${extension}`;
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

  return <p>Preview not available for this file type.({type.toString()})</p>;
};

export default PreviewComponent;

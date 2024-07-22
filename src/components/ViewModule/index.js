import React, { useState, useEffect } from 'react';

const ViewModule = (props) => {
  const { file }=props
  const [fileContent, setFileContent] = useState(null);
  
  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        setFileContent(event.target.result);
      };
      
      reader.readAsText(file); // Read the file as text. You can change this if you are dealing with binary files.
    }
  }, [file]);

  return (
    <div className="file-display">
      {fileContent ? (
        <div>
          <h2>File Content:</h2>
          <pre>{fileContent}</pre>
        </div>
      ) : (
        <p>No file selected or file is empty.</p>
      )}
    </div>
  );
};

export default ViewModule;

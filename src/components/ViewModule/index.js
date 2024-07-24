import React from "react";

const ViewModule = (props) => {
  const file=null;
  if (!file) {
    return <div>No file selected</div>;
  }

  const fileURL = URL.createObjectURL(file);

  return (
    <div>
      <h2>Uploaded File</h2>
      <div>
        <p>File Name: {file.name}</p>
        <p>File Size: {file.size} bytes</p>
        <a href={fileURL} download={file.name}>
          Download File
        </a>
      </div>
    </div>
  );
};

export default ViewModule;

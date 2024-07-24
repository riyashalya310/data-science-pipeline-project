import React from 'react';
import { useSelector } from 'react-redux';

const ViewModule = () => {
  // Get the list of files from the Redux state
  const files = useSelector((state) => state.users);

  return (
    <div className="file-display">
      {files.length > 0 ? (
        <div>
          <h2>Files:</h2>
          <ul>
            {files.map((file, index) => (
              <li key={index}>
                <strong>Name:</strong> {file.name}<br />
                <strong>Size:</strong> {file.size} bytes<br />
                <strong>Last Modified:</strong> {new Date(file.lastModified).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>No file selected or file is empty.</p>
      )}
    </div>
  );
};

export default ViewModule;

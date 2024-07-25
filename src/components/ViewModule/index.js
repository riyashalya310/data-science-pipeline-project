import React from 'react';
import { useSelector } from 'react-redux';
import './index.css'

const ViewModule = () => {
  const files = useSelector((state) => state.users);
  const file = files[files.length - 1]; // Get the last uploaded file

  return (
    <div className="file-display">
      {file ? (
        <div>
          <h2>File Content: {file.name}</h2>
          {Array.isArray(file.content) ? (
            <table className="file-table">
              <thead>
                <tr>
                  {Object.keys(file.content[0]).map((key) => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {file.content.map((row, index) => (
                  <tr key={index}>
                    {Object.values(row).map((value, i) => (
                      <td key={i}>{value}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>The file content is not in the expected format.</p>
          )}
        </div>
      ) : (
        <p>No file selected or file is empty.</p>
      )}
    </div>
  );
};

export default ViewModule;

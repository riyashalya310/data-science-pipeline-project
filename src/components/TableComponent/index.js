import React, { useState } from 'react';
import './TableColumn.css'; // Ensure the correct path to the CSS file

const TableColumn = ({ file }) => {
  const [isTableVisible, setTableVisible] = useState(true);

  const files = useSelector((state) => state.user.files);
  const file = files.find((f) => f.name === "birthplace-2018-census-csv.csv"); 

  if (!file || !file.content || !file.content.length) {
    return <p>No data available to display.</p>;
  }

  // Extract table headers from the first row of data
  const headers = Object.keys(file.content[0]);

  const toggleTableVisibility = () => {
    setTableVisible(!isTableVisible);
  };

  return (
    <div className="table-column-wrapper">
      {isTableVisible && (
        <>
          <div className="table-scroll-container">
            <table className="table-column">
              <thead>
                <tr>
                  {headers.map((header, index) => (
                    <th key={index}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {file.content.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {headers.map((header, colIndex) => (
                      <td key={colIndex}>{row[header]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={toggleTableVisibility} className="toggle-btn">Hide Table</button>
        </>
      )}
      {!isTableVisible && (
        <button onClick={toggleTableVisibility} className="toggle-btn">Show Table</button>
      )}
    </div>
  );
};

export default TableColumn;

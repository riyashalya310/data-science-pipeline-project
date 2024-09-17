import React, { useState } from "react";
import "./index.css"; // Create a separate CSS file for styling

const SelectColumnsPopup = ({ columns, onEncode, onClose }) => {
  const [selectedColumns, setSelectedColumns] = useState([]);

  const handleColumnChange = (column) => {
    setSelectedColumns((prev) =>
      prev.includes(column)
        ? prev.filter((col) => col !== column)
        : [...prev, column]
    );
  };

  const handleSubmit = () => {
    onEncode(selectedColumns);
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Select Categorical Columns to Encode</h2>
        <ul>
          {columns.map((column) => (
            <li key={column}>
              <label>
                <input
                  type="checkbox"
                  checked={selectedColumns.includes(column)}
                  onChange={() => handleColumnChange(column)}
                />
                {column}
              </label>
            </li>
          ))}
        </ul>
        <button onClick={handleSubmit}>Encode</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default SelectColumnsPopup;

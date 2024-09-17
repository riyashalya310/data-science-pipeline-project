import React, { useState } from 'react';
import './index.css'; // Ensure this path is correct for your CSS file

const SelectColumnsPopup = ({ columns, onSubmit, onClose }) => {
  const [selectedColumns, setSelectedColumns] = useState([]);

  const handleCheckboxChange = (columnName) => {
    setSelectedColumns((prev) =>
      prev.includes(columnName)
        ? prev.filter((col) => col !== columnName)
        : [...prev, columnName]
    );
  };

  const handleSubmit = () => {
    onSubmit(selectedColumns);
    onClose();
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h3>Select Columns for Aggregation</h3>
        <div className="columns-list">
          {columns.map((col) => (
            <div key={col}>
              <input
                type="checkbox"
                checked={selectedColumns.includes(col)}
                onChange={() => handleCheckboxChange(col)}
              />
              <label>{col}</label>
            </div>
          ))}
        </div>
        <div className='buttons-group-popup'>
        <button className="submit-btn" onClick={handleSubmit}>Submit</button>
        <button className="close-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default SelectColumnsPopup;

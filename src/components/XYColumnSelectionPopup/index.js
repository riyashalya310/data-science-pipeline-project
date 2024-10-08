import React, { useState } from 'react';
import './index.css'; // Importing the CSS file for styling

const XYColumnSelectionPopup = ({ availableColumns, onClose, onSubmit }) => {
  const [xColumn, setXColumn] = useState('');
  const [yColumn, setYColumn] = useState('');

  const handleSubmit = () => {
    if (xColumn && yColumn) {
      onSubmit([xColumn, yColumn]);
      onClose(); // Close the popup after submission
    } else {
      alert("Please select both x and y columns.");
    }
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup" onClick={(e) => e.stopPropagation()}> {/* Prevent click event from bubbling up to overlay */}
        <h2>Select X and Y Columns for Bivariate Analysis</h2>
        <div className="form-group">
          <label>X-axis Column:</label>
          <select value={xColumn} onChange={(e) => setXColumn(e.target.value)}>
            <option value="">Select X-axis Column</option>
            {availableColumns.map((column) => (
              <option key={column} value={column}>{column}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Y-axis Column:</label>
          <select value={yColumn} onChange={(e) => setYColumn(e.target.value)}>
            <option value="">Select Y-axis Column</option>
            {availableColumns.map((column) => (
              <option key={column} value={column}>{column}</option>
            ))}
          </select>
        </div>
        <div className="button-container">
          <button className="submit-btn" onClick={handleSubmit}>Submit</button>
          <button className="close-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default XYColumnSelectionPopup;

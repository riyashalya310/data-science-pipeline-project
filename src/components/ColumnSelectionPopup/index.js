import React, { useState } from "react";
import "./index.css";

const SelectColumnsPopup = ({ columns, onSubmit, onClose, isCategoricalStep, title }) => {
  const [selectedColumn, setSelectedColumn] = useState("");
  
  const handleColumnChange = (event) => {
    setSelectedColumn(event.target.value);
  };

  const handleSubmit = () => {
    if (selectedColumn) {
      onSubmit(selectedColumn);
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h3>{title}</h3>
        <div className="dropdown-container">
          <select value={selectedColumn} onChange={handleColumnChange}>
            <option value="">Select a column</option>
            {columns.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>
        <div className="buttons-group-popup">
          <button className="submit-btn" onClick={handleSubmit}>
            OK
          </button>
          <button className="close-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectColumnsPopup;

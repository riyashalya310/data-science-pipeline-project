import React, { useState } from "react";
import { CiSquareRemove } from "react-icons/ci";
import "./index.css";

const Slicer = ({ file, onRemove }) => {
  const [selectedColumn, setSelectedColumn] = useState("");
  const [selectedValues, setSelectedValues] = useState([]);

  const columns = Object.keys(file.content[0] || {});

  const handleColumnChange = (event) => {
    setSelectedColumn(event.target.value);
    setSelectedValues([]); // Reset values when a new column is selected
  };

  const handleValueChange = (value) => {
    const updatedValues = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    setSelectedValues(updatedValues);
  };

  const uniqueValues = selectedColumn && [
    ...new Set(file.content.map((row) => row[selectedColumn])),
  ];

  return (
    <div className="slicer">
      <button
        className="remove-button"
        style={{ padding: "0", backgroundColor: "none",top: "0px",right: "0px" }}
        onClick={onRemove}
      >
        <CiSquareRemove />
      </button>
      <h4>Slicer</h4>
      <select value={selectedColumn} onChange={handleColumnChange}>
        <option value="">Select Column</option>
        {columns.map((col) => (
          <option key={col} value={col}>
            {col}
          </option>
        ))}
      </select>
      {uniqueValues && (
        <div className="value-list">
          {uniqueValues.map((val) => (
            <label key={val}>
              <input
                type="checkbox"
                checked={selectedValues.includes(val)}
                onChange={() => handleValueChange(val)}
              />
              {val}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default Slicer;

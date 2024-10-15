// TableInputPopup.js
import React, { useState } from "react";
import "./index.css";

const TableInputPopup = ({ onClose, onSubmit }) => {
  const [rows, setRows] = useState(0);
  const [columns, setColumns] = useState(0);

  const handleSubmit = () => {
    if (rows > 0 && columns > 0) {
      onSubmit(rows, columns);
      onClose();
    }
  };

  return (
    <div className="popup">
      <div className="popup-content">
        <h2>Enter Table Dimensions</h2>
        <div>
          <label>Rows:</label>
          <input
            type="number"
            value={rows}
            onChange={(e) => setRows(Number(e.target.value))}
            min="1"
          />
        </div>
        <div>
          <label>Columns:</label>
          <input
            type="number"
            value={columns}
            onChange={(e) => setColumns(Number(e.target.value))}
            min="1"
          />
        </div>
        <div style={{margin: "20px"}}>
          <button onClick={handleSubmit}>Create Table</button>
          <button onClick={onClose} style={{ marginLeft: "20px" }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableInputPopup;

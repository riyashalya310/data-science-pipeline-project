// src/components/TableCreationPopup.jsx
import React, { useState } from 'react';
import './index.css'; // Make sure to include this CSS file

const TableCreationPopup = ({ onSubmit, onClose }) => {
  const [rows, setRows] = useState(3);
  const [columns, setColumns] = useState(3);

  const handleSubmit = () => {
    onSubmit(rows, columns);
    onClose();
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Create New Table</h2>
        <label>
          Rows:
          <input
            type="number"
            value={rows}
            onChange={(e) => setRows(Number(e.target.value))}
            min="1"
          />
        </label>
        <label>
          Columns:
          <input
            type="number"
            value={columns}
            onChange={(e) => setColumns(Number(e.target.value))}
            min="1"
          />
        </label>
        <button onClick={handleSubmit}>Submit</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default TableCreationPopup;

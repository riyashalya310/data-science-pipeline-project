import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import "./index.css"; // Import your CSS file for styling

const ChatSidebar = ({
  isOpen,
  onClose,
  onSend,
  options,
  messages,
  awaitingTypeChange,
  awaitingColumnInput,
  awaitingOutlierConfirmation,
  awaitingOutlierColumns,  // Add awaitingOutlierColumns prop
  awaitingNullDeletionConfirmation,  // Add awaitingNullDeletionConfirmation prop
}) => {
  const [input, setInput] = useState("");
  const [dtypeInput, setDtypeInput] = useState(""); // State for dtype input

  const handleSend = () => {
    // Handle input based on the current awaiting state
    if (awaitingColumnInput && dtypeInput.trim()) {
      onSend(dtypeInput); // Send dtype input when awaiting column input
      setDtypeInput(""); // Clear the dtype input field
    } else if (awaitingOutlierConfirmation && input.trim()) {
      onSend(input); // Send input for outlier confirmation
      setInput(""); // Clear input field
    } else if (awaitingOutlierColumns && input.trim()) { // Handle column input for outlier removal
      onSend(input); // Send input when awaiting column names for outliers
      setInput(""); // Clear input field
    } else if (awaitingNullDeletionConfirmation && input.trim()) { // Handle null deletion confirmation
      onSend(input); // Send yes/no input for null deletion
      setInput(""); // Clear input field
    } else if (!awaitingColumnInput && !awaitingOutlierConfirmation && !awaitingOutlierColumns && !awaitingNullDeletionConfirmation && input.trim()) {
      onSend(input); // Send normal input
      setInput(""); // Clear the input field
    }
  };

  return (
    <div className={`chat-sidebar ${isOpen ? "open" : ""}`}>
      <button className="chat-sidebar-close" onClick={onClose}>
        <FaTimes />
      </button>
      <div className="chat-content">
        {/* Render chat messages here */}
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.type}`}>
              {msg.text}
            </div>
          ))}
        </div>
      </div>
      <div className="chat-input-container">
        {awaitingColumnInput ? (
          <>
            <input
              type="text"
              value={dtypeInput}
              onChange={(e) => setDtypeInput(e.target.value)}
              placeholder="Type as {column name} : {dtype:}"
              className="chat-text-input"
            />
            <button onClick={handleSend}>Send</button>
          </>
        ) : awaitingOutlierConfirmation ? ( // Check for outlier confirmation
          <>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type 'yes' or 'no' to confirm outlier removal"
              className="chat-text-input"
            />
            <button onClick={handleSend}>Send</button>
          </>
        ) : awaitingOutlierColumns ? ( // Check for column input for outliers
          <>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter column names separated by spaces, or type 'all'"
              className="chat-text-input"
            />
            <button onClick={handleSend}>Send</button>
          </>
        ) : awaitingNullDeletionConfirmation ? ( // Check for null deletion confirmation
          <>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type 'yes' or 'no' to confirm null value removal"
              className="chat-text-input"
            />
            <button onClick={handleSend}>Send</button>
          </>
        ) : (
          <>
            <select
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="chat-dropdown"
            >
              <option value="">Select an option</option>
              {options.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <button onClick={handleSend}>Send</button>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;

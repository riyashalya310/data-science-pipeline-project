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
}) => {
  const [input, setInput] = useState("");
  const [dtypeInput, setDtypeInput] = useState(""); // Add state for dtype input

  const handleSend = () => {
    if (awaitingColumnInput && dtypeInput.trim()) {
      onSend(dtypeInput); // Send dtype input when awaiting column input
      setDtypeInput(""); // Clear the dtype input field
    } else if (!awaitingColumnInput && input.trim()) {
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

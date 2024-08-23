import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import "./index.css"; // Import your CSS file for styling

const ChatSidebar = ({ isOpen, onClose, onSend, options, messages }) => {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      onSend(input);
      setInput("");
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
      </div>
    </div>
  );
};

export default ChatSidebar;

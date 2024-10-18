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
  awaitingOutlierColumns,
  awaitingNullDeletionConfirmation,
  awaitingCategoricalColumn,
  awaitingEncodingMethod,
  categoricalColumns,
  selectedCategoricalColumn, // New prop for available categorical columns
}) => {
  const [input, setInput] = useState("");
  const [dtypeInput, setDtypeInput] = useState(""); // State for dtype input
  const [selectedColumn, setSelectedColumn] = useState(""); // State for selected categorical column
  const [selectedEncodingMethod, setSelectedEncodingMethod] = useState(""); // State for selected encoding method

  const encodingMethods = [
    "One-hot Encoding",
    "Label Encoding",
    "Ordinal Encoding",
  ]; // Encoding methods options

  const handleSend = () => {
    if (awaitingColumnInput && dtypeInput.trim()) {
      onSend(dtypeInput); // Send dtype input when awaiting column input
      setDtypeInput(""); // Clear the dtype input field
    } else if (awaitingOutlierConfirmation && input.trim()) {
      onSend(input); // Send input for outlier confirmation
      setInput(""); // Clear input field
    } else if (awaitingOutlierColumns && input.trim()) {
      onSend(input); // Send input when awaiting column names for outliers
      setInput(""); // Clear input field
    } else if (awaitingNullDeletionConfirmation && input.trim()) {
      onSend(input); // Send yes/no input for null deletion
      setInput(""); // Clear input field
    } else if (awaitingCategoricalColumn && selectedColumn) {
      onSend(selectedColumn); // Send selected categorical column
      setSelectedColumn(""); // Clear selected column
    } else if (awaitingEncodingMethod && selectedEncodingMethod) {
      onSend(selectedEncodingMethod); // Send selected encoding method
      setSelectedEncodingMethod(""); // Clear selected encoding method
    } else if (
      !awaitingColumnInput &&
      !awaitingOutlierConfirmation &&
      !awaitingOutlierColumns &&
      !awaitingNullDeletionConfirmation &&
      input.trim()
    ) {
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
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.type}`}>
              {msg.type === "bot" ? (
                <>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: msg.text.replace(/<table.*<\/table>/, ""),
                    }}
                  />
                  {msg.text.includes("<table") && (
                    <div className="chat-table-container">
                      {(() => {
                        const tableMatch = msg.text.match(/<table.*<\/table>/);
                        return tableMatch ? (
                          <div
                            className="chat-table"
                            dangerouslySetInnerHTML={{
                              __html: tableMatch[0],
                            }}
                          />
                        ) : null;
                      })()}
                    </div>
                  )}
                </>
              ) : (
                <p>{msg.text}</p>
              )}
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
              placeholder="Type as column names separated by commas"
              className="chat-text-input"
            />
            <button onClick={handleSend}>Send</button>
          </>
        ) : awaitingOutlierConfirmation ? (
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
        ) : awaitingOutlierColumns ? (
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
        ) : awaitingNullDeletionConfirmation ? (
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
        ) : awaitingCategoricalColumn && categoricalColumns ? (
          <>
            <select
              value={selectedColumn}
              onChange={(e) => setSelectedColumn(e.target.value)}
              className="chat-dropdown"
            >
              <option value="">Select a categorical column</option>
              {categoricalColumns.map((col, index) => (
                <option key={index} value={col}>
                  {col}
                </option>
              ))}
            </select>
            <button onClick={handleSend}>Send</button>
          </>
        ) : awaitingEncodingMethod ? (
          <>
            <select
              value={selectedEncodingMethod}
              onChange={(e) => setSelectedEncodingMethod(e.target.value)}
              className="chat-dropdown"
            >
              <option value="">Select an encoding method</option>
              {encodingMethods.map((method, index) => (
                <option key={index} value={method}>
                  {method}
                </option>
              ))}
            </select>
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
              {options &&
                options.map((option, index) => (
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

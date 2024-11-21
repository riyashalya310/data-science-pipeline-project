import React, { useState,useRef,useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import "./index.css";

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
  awaitingScaleColumn,
  categoricalColumns,
  numericalColumns,
  outlierColumns,
  selectedCategoricalColumn,
}) => {
  const [input, setInput] = useState("");
  const [dtypeInput, setDtypeInput] = useState("");
  const [selectedColumn, setSelectedColumn] = useState("");
  const [selectedEncodingMethod, setSelectedEncodingMethod] = useState("");

  const chatMessagesRef = useRef(null);

  const encodingMethods = [
    "One-hot Encoding",
    "Label Encoding",
    "Ordinal Encoding",
  ];

  const handleSend = () => {
    if (awaitingColumnInput && dtypeInput.trim()) {
      onSend(dtypeInput);
      setDtypeInput("");
    } else if (awaitingOutlierConfirmation && input.trim()) {
      onSend(input);
      setInput("");
    } else if (awaitingOutlierColumns && selectedColumn) {
      onSend(selectedColumn);
      setSelectedColumn("");
    } else if (awaitingNullDeletionConfirmation && input.trim()) {
      onSend(input);
      setInput("");
    } else if (awaitingCategoricalColumn && selectedColumn) {
      onSend(selectedColumn);
      setSelectedColumn("");
    } else if (awaitingEncodingMethod && selectedEncodingMethod) {
      onSend(selectedEncodingMethod);
      setSelectedEncodingMethod("");
    } else if (awaitingScaleColumn && selectedColumn) {
      onSend(selectedColumn); // Send the selected column to be scaled
      setSelectedColumn(""); // Clear selected column after sending
    } else if (
      !awaitingColumnInput &&
      !awaitingOutlierConfirmation &&
      !awaitingOutlierColumns &&
      !awaitingNullDeletionConfirmation &&
      input.trim()
    ) {
      onSend(input);
      setInput("");
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSend();
    }
  };

  const handleNullDeletionSelection = (value) => {
    onSend(value);
    setInput("");
  };

  const handleOutlierConfirmationSelection = (value) => {
    onSend(value);
    setInput("");
  };

  const handleOutlierColumnSelection = (column) => {
    onSend(column);
    setSelectedColumn("");
  };

  const handleScaleColumnSelection = (column) => {
    onSend(column);
    setSelectedColumn("");
  };

  useEffect(() => {
    if (chatMessagesRef.current) {
      // Use setTimeout to ensure scrolling occurs after DOM updates
      setTimeout(() => {
        chatMessagesRef.current.scrollTop =
          chatMessagesRef.current.scrollHeight;
      }, 0);
    }
  }, [messages, isOpen]);

  return (
    <div className={`chat-sidebar ${isOpen ? "open" : ""}`}>
      <button className="chat-sidebar-close" onClick={onClose}>
        <FaTimes />
      </button>
      <div className="chat-content">
        <div className="chat-messages"  ref={chatMessagesRef}>
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
              onKeyDown={handleKeyDown}
            />
            <button onClick={handleSend}>Send</button>
          </>
        ) : awaitingOutlierConfirmation ? (
          <>
            <div className="confirmation-dropdown">
              <label>Do you want to remove outliers?</label>
              <select onChange={(e) => handleOutlierConfirmationSelection(e.target.value)}>
                <option value="">Select an option</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </>
        ) : awaitingOutlierColumns ? (
          <>
            <select
              value={selectedColumn}
              onChange={(e) => handleOutlierColumnSelection(e.target.value)}
              className="chat-dropdown"
              onKeyDown={handleKeyDown}
            >
              <option value="">Select a column to remove outliers</option>
              {outlierColumns.map((col, index) => (
                <option key={index} value={col}>
                  {col}
                </option>
              ))}
              <option value="all">All Columns</option>
            </select>
            <button onClick={handleSend}>Send</button>
          </>
        ) : awaitingNullDeletionConfirmation ? (
          <>
            <div className="confirmation-dropdown">
              <label>Do you want to delete rows with null/empty values?</label>
              <select onChange={(e) => handleNullDeletionSelection(e.target.value)}>
                <option value="">Select an option</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </>
        ) : awaitingScaleColumn ? (
          <>
            <select
              value={selectedColumn}
              onChange={(e) => handleScaleColumnSelection(e.target.value)}
              className="chat-dropdown"
              onKeyDown={handleKeyDown}
            >
              <option value="">Select a column to scale</option>
              {numericalColumns.map((col, index) => (
                <option key={index} value={col}>
                  {col}
                </option>
              ))}
            </select>
            <button onClick={handleSend}>Scale Column</button>
          </>
        ) : awaitingCategoricalColumn && categoricalColumns ? (
          <>
            <select
              value={selectedColumn}
              onChange={(e) => setSelectedColumn(e.target.value)}
              className="chat-dropdown"
              onKeyDown={handleKeyDown}
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
              onKeyDown={handleKeyDown}
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
              onKeyDown={handleKeyDown}
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

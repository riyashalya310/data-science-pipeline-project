import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FaArrowRight } from "react-icons/fa";
import { IoMdArrowBack } from "react-icons/io";
import ChatSidebar from "../SideBar"; // Adjust import path as necessary
import "./index.css"; // Import your CSS file for styling
import { updateFileContent } from "../../redux/actions"; // Ensure correct path

const ETLModule = (props) => {
  const files = useSelector((state) => state.user.files);
  const file = files.length > 0 ? files[files.length - 1] : null;
  const [isChatOpen, setIsChatOpen] = useState(true); // Initially open the chat
  const [messages, setMessages] = useState([
    {
      type: "bot",
      text: "Hello! I'm here to assist you with your data. What would you like to do?",
    },
    { type: "bot", text: "Please select an option from the dropdown below." },
  ]);
  const [filteredContent, setFilteredContent] = useState(file ? file.content : []);
  const [awaitingTypeChange, setAwaitingTypeChange] = useState(false);
  const [awaitingColumnInput, setAwaitingColumnInput] = useState(false); // Add state for awaiting column input
  const dispatch = useDispatch();

  const moveToAnalysisBtn = () => {
    const { history } = props;
    history.push("/view");
  };

  const backBtn = () => {
    const { history } = props;
    history.push("/");
  };

  const handleSendMessage = (message) => {
    let updatedContent = [...filteredContent]; // Clone the filteredContent
    let initialMessage = "";
    let finalMessage = "";
  
    // Display the user's message first
    setMessages((prevMessages) => [
      ...prevMessages,
      { type: "user", text: message },
    ]);
  
    if (awaitingColumnInput) {
      if (message.toLowerCase() === "no") {
        // Reset back to dropdown input
        setAwaitingColumnInput(false);
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: "bot", text: "No changes made." },
          { type: "bot", text: "Please select an option from the dropdown below." },
        ]);
        return;
      }
  
      // Split the message to extract column name and dtype
      const [columnName, dtype] = message.split(":").map((item) => item.trim());
  
      if (columnName && dtype) {
        initialMessage = `Changing the data type of column '${columnName}' to '${dtype}'...`;
  
        // Deep copy the filteredContent to avoid immutability issues
        updatedContent = filteredContent.map((row) => {
          const newRow = { ...row }; // Create a shallow copy of the row
          if (columnName in newRow) {
            // Apply the specified dtype conversion
            if (dtype === "string") {
              newRow[columnName] = String(newRow[columnName]);
            } else if (dtype === "number") {
              newRow[columnName] = Number(newRow[columnName]);
            } else if (dtype === "boolean") {
              newRow[columnName] = Boolean(newRow[columnName]);
            }
          }
          return newRow; // Return the updated row
        });
  
        finalMessage = `Data type of column '${columnName}' changed to '${dtype}'.`;
  
        // Update the filteredContent state to re-render the table with the updated content
        setFilteredContent(updatedContent);
        setAwaitingColumnInput(false);
  
        // Dispatch the updated content to the Redux store
        dispatch(updateFileContent(file.name, updatedContent));
      } else {
        finalMessage =
          "Invalid format. Please write it as - {column name} : {dtype:}.";
      }
  
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: "bot", text: initialMessage },
        { type: "bot", text: finalMessage },
        { type: "bot", text: "Please select an option from the dropdown below." },
      ]);
    } else if (message === "Show Info About Columns") {
      initialMessage = "Gathering information about columns...";
      finalMessage = "Here is the information about the columns:";
  
      const infoMessages = Object.keys(filteredContent[0]).map((key) => {
        const nonNullValues = filteredContent
          .map((row) => row[key])
          .filter((value) => value !== null && value !== "").length;
        return `Column: ${key}, Non-null Count: ${nonNullValues}, Data Type: ${typeof filteredContent[0][key]}`;
      });
  
      setAwaitingColumnInput(true); // Set column input mode
      setAwaitingTypeChange(false); // Disable dtype change flag
  
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: "bot", text: initialMessage },
        { type: "bot", text: finalMessage },
        ...infoMessages.map((info) => ({ type: "bot", text: info })),
        {
          type: "bot",
          text: "If you want to change the data type of any column, write it as - {column name} : {dtype:}, or type 'no' to skip.",
        },
      ]);
    } else if (message === "Handle NA") {
      initialMessage = "Handling NA values...";
  
      updatedContent = updatedContent.filter((row) => {
        const hasNull = Object.values(row).some(
          (value) => value === null || value === ""
        );
        return !hasNull;
      });
  
      finalMessage = updatedContent.length < filteredContent.length ? "Great! Null values handled." : "No null values present.";
  
      setFilteredContent(updatedContent);
      dispatch(updateFileContent(file.name, updatedContent)); // Dispatch updated content
  
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: "bot", text: initialMessage },
        { type: "bot", text: finalMessage },
        { type: "bot", text: "Please select an option from the dropdown below." },
      ]);
    } else if (message === "Remove Duplicates") {
      initialMessage = "Removing duplicate rows...";
  
      const uniqueContent = new Set();
      updatedContent = updatedContent.filter((row) => {
        const rowString = JSON.stringify(row);
        if (uniqueContent.has(rowString)) {
          return false;
        } else {
          uniqueContent.add(rowString);
          return true;
        }
      });
  
      finalMessage = updatedContent.length < filteredContent.length ? "Great! Duplicates removed." : "No duplicates found.";
  
      setFilteredContent(updatedContent);
      dispatch(updateFileContent(file.name, updatedContent)); // Dispatch updated content
  
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: "bot", text: initialMessage },
        { type: "bot", text: finalMessage },
        { type: "bot", text: "Please select an option from the dropdown below." },
      ]);
    } else if (message === "Exit") {
      initialMessage = "Exiting...";
      finalMessage = "Great! Ask me a question whenever you want!";
      setIsChatOpen(false);
  
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: "bot", text: initialMessage },
        { type: "bot", text: finalMessage },
      ]);
    } else {
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: "bot", text: "Please choose a valid option from the dropdown." },
      ]);
    }
  };  
  
  

  return (
    <div className="etl-module-container">
      <div className={`etl-content ${isChatOpen ? "with-chat-open" : "with-chat-closed"}`}>
        {file ? (
          <div>
            <div className="etl-header">
              <button type="button" className="btn btn-primary" onClick={backBtn}>
                <IoMdArrowBack />
                Back
              </button>
              <h2 className="file-content-heading">
                File Content: <span className="file-name">{file.name}</span>
              </h2>
              <button type="button" className="btn btn-primary" onClick={moveToAnalysisBtn}>
                Final View
                <FaArrowRight />
              </button>
            </div>
            {Array.isArray(filteredContent) && filteredContent.length > 0 ? (
              <table className="file-table">
                <thead>
                  <tr>
                    {Object.keys(filteredContent[0]).map((key) => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredContent.map((row, index) => (
                    <tr key={index}>
                      {Object.values(row).map((value, i) => (
                        <td key={i}>{value}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No data available</p>
            )}
          </div>
        ) : (
          <p>No file selected</p>
        )}
        <button className={`reopen-chat-btn ${isChatOpen ? "hidden" : ""}`} onClick={() => setIsChatOpen(true)}>
          Reopen Chat
        </button>
      </div>
      <ChatSidebar
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onSend={handleSendMessage}
        options={["Handle NA", "Remove Duplicates", "Show Info About Columns", "Exit"]}
        messages={messages}
        awaitingTypeChange={awaitingTypeChange}
        awaitingColumnInput={awaitingColumnInput} // Pass new prop
      />
    </div>
  );
};

export default ETLModule;

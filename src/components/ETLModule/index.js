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
    { type: "bot", text: "Hello! I'm here to assist you with your data. What would you like to do?" },
    { type: "bot", text: "Please select an option from the dropdown below." },
  ]);
  const [filteredContent, setFilteredContent] = useState(file ? file.content : []); // Add filteredContent state
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
    let updatedContent = [...file.content]; // Clone the file content
    let initialMessage = "";
    let finalMessage = "";

    // Display the user's message first
    setMessages((prevMessages) => [
      ...prevMessages,
      { type: "user", text: message }
    ]);

    if (message === "Handle NA") {
      initialMessage = "Handling NA values...";

      // Process content to remove rows with null or empty values
      updatedContent = updatedContent.filter(row => {
        const hasNull = Object.values(row).some(value => value === null || value === "");
        return !hasNull;
      });

      if (updatedContent.length < file.content.length) {
        finalMessage = "Great! Null values handled.";
      } else {
        finalMessage = "No null values present.";
      }

      // Update the filteredContent state to re-render the table with the updated content
      setFilteredContent(updatedContent);

    } else if (message === "Remove Duplicates") {
      initialMessage = "Removing duplicate rows...";

      // Process content to remove duplicate rows
      const uniqueContent = new Set();
      updatedContent = updatedContent.filter(row => {
        const rowString = JSON.stringify(row);
        if (uniqueContent.has(rowString)) {
          return false;
        } else {
          uniqueContent.add(rowString);
          return true;
        }
      });

      if (updatedContent.length < file.content.length) {
        finalMessage = "Great! Duplicates removed.";
      } else {
        finalMessage = "No duplicates found.";
      }

      // Update the filteredContent state to re-render the table with the updated content
      setFilteredContent(updatedContent);

    } else if (message === "Exit") {
      initialMessage = "Exiting...";
      finalMessage = "Great! Ask me a question whenever you want!";
      setIsChatOpen(false); // Close the chat after saying goodbye
    } else {
      finalMessage = "Please choose a valid option from the dropdown.";
    }

    // Dispatch the updated content to the Redux store
    dispatch(updateFileContent(file.name, updatedContent));

    // Update messages with the initial and final bot responses
    setMessages((prevMessages) => [
      ...prevMessages,
      { type: "bot", text: initialMessage },
      { type: "bot", text: finalMessage }
    ]);
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
              <button
                type="button"
                className="btn btn-primary"
                onClick={moveToAnalysisBtn}
              >
                Final View
                <FaArrowRight />
              </button>
            </div>
            {Array.isArray(filteredContent) && filteredContent.length > 0 ? ( // Display filteredContent
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
              <p>The file content is not in the expected format or no data available.</p>
            )}
          </div>
        ) : (
          <p>No file selected or file is empty.</p>
        )}
        <button
          className={`reopen-chat-btn ${isChatOpen ? "hidden" : ""}`}
          onClick={() => setIsChatOpen(true)}
        >
          Reopen Chat
        </button>
      </div>
      <ChatSidebar
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onSend={handleSendMessage}
        options={["Handle NA", "Remove Duplicates", "Exit"]}
        messages={messages} // Pass messages to ChatSidebar
      />
    </div>
  );
};

export default ETLModule;

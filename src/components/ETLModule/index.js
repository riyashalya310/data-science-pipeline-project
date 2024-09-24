import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FaArrowRight } from "react-icons/fa";
import { IoMdArrowBack } from "react-icons/io";
import ChatSidebar from "../SideBar";
import "./index.css";
import { updateFile } from "../../store/slices/userSlice";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

// detecting outliers through z-score  (observed value-mean of sample)/standard deviation of sample
const detectOutliers = (data, column) => {
  const values = data
    .map((row) => row[column])
    .filter((value) => typeof value === "number");
  const mean = values.reduce((acc, val) => acc + val, 0) / values.length;
  const variance =
    values.reduce((acc, val) => acc + (val - mean) ** 2, 0) / values.length;
  const stdDev = Math.sqrt(variance);
  return values.filter((value) => Math.abs(value - mean) > 2 * stdDev);
};

// Utility functions for scaling
const minMaxScale = (value, min, max) => (value - min) / (max - min);
const zScoreScale = (value, mean, stdDev) => (value - mean) / stdDev;

const mean = (values) =>
  values.reduce((sum, value) => sum + value, 0) / values.length;
const stdDev = (values) =>
  Math.sqrt(mean(values.map((value) => Math.pow(value - mean(values), 2))));

const ETLModule = (props) => {
  const files = useSelector((state) => state.user.files);
  const file = files.length > 0 ? files[files.length - 1] : null;
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [messages, setMessages] = useState([
    {
      type: "bot",
      text: "Hello! I'm here to assist you with your data. What would you like to do?",
    },
    { type: "bot", text: "Please select an option from the dropdown below." },
  ]);
  const [filteredContent, setFilteredContent] = useState(
    file ? file.content : []
  );
  const [awaitingTypeChange, setAwaitingTypeChange] = useState(false);
  const [awaitingColumnInput, setAwaitingColumnInput] = useState(false);
  const [outliers, setOutliers] = useState([]);
  const [awaitingOutlierConfirmation, setAwaitingOutlierConfirmation] =
    useState(false);
  const [columns, setColumns] = useState(
    file ? Object.keys(file.content[0]) : []
  );
  const [scalingColumns, setScalingColumns] = useState(false);
  const [numericalColumns, setNumericalColumns] = useState([]);
  
  const dispatch = useDispatch();

  const moveToAnalysisBtn = () => {
    const { history } = props;
    history.push("/view");
  };

  const backBtn = () => {
    const { history } = props;
    history.push("/");
  };

  const handleExit = () => {
    // Dispatch the updated content to the Redux store before exiting
    dispatch(updateFile(file.name, filteredContent));

    // Close the chat and any other cleanup (if needed)
    setIsChatOpen(false);
  };

  const handleSendMessage = async (message) => {
    let updatedContent = [...filteredContent];
    let initialMessage = "";
    let finalMessage = "";

    setMessages((prevMessages) => [
      ...prevMessages,
      { type: "user", text: message }
    ]);

    if (awaitingColumnInput) {
      if (message.toLowerCase() === "no") {
        setAwaitingColumnInput(false);
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: "bot", text: "No changes made." },
          { type: "bot", text: "Please select an option from the dropdown below." }
        ]);
        return;
      }

      // Handling column scaling if awaiting for column names
      if (scalingColumns) {
        const selectedColumns = message.split(",").map(name => name.trim());
        const columnsToScale = selectedColumns.filter(name => numericalColumns.includes(name));

        if (columnsToScale.length > 0) {
          initialMessage = "Scaling selected columns...";
          const scaledContent = filteredContent.map(row => {
            const newRow = { ...row };
            columnsToScale.forEach(col => {
              const values = filteredContent.map(r => r[col]).filter(v => typeof v === 'number');
              const colMean = mean(values);
              const colStdDev = stdDev(values);
              newRow[col] = zScoreScale(row[col], colMean, colStdDev).toFixed(2);
            });
            return newRow;
          });

          finalMessage = "Columns scaled.";

          setFilteredContent(scaledContent);
          setAwaitingColumnInput(false);
          setScalingColumns(false);

          dispatch(updateFile(file.name, scaledContent));
          console.log(`Scaled - ${file}`)

          setMessages((prevMessages) => [
            ...prevMessages,
            { type: "bot", text: initialMessage },
            { type: "bot", text: finalMessage },
            { type: "bot", text: "Please select an option from the dropdown below." }
          ]);
        } else {
          finalMessage = "Invalid column names. No columns scaled.";
          setMessages((prevMessages) => [
            ...prevMessages,
            { type: "bot", text: finalMessage }
          ]);
        }
        return;
      }

      // Handling other types of column input
      const [columnName, dtype] = message.split(":").map(item => item.trim());

      if (columnName && dtype) {
        initialMessage = `Changing the data type of column '${columnName}' to '${dtype}'...`;

        updatedContent = filteredContent.map(row => {
          const newRow = { ...row };
          if (columnName in newRow) {
            if (dtype === "string") {
              newRow[columnName] = String(newRow[columnName]);
            } else if (dtype === "number") {
              newRow[columnName] = Number(newRow[columnName]);
            } else if (dtype === "boolean") {
              newRow[columnName] = Boolean(newRow[columnName]);
            }
          }
          return newRow;
        });

        finalMessage = `Data type of column '${columnName}' changed to '${dtype}'.`;

        setFilteredContent(updatedContent);
        setAwaitingColumnInput(false);

        dispatch(updateFile(file.name, updatedContent));
        console.log(`Changing dtype - ${file}`)
      } else {
        finalMessage = "Invalid format. Please write it as - {column name} : {dtype:}.";
      }

      setMessages((prevMessages) => [
        ...prevMessages,
        { type: "bot", text: initialMessage },
        { type: "bot", text: finalMessage },
        { type: "bot", text: "Please select an option from the dropdown below." }
      ]);
    } else if (message === "Show Info About Columns") {
      initialMessage = "Gathering information about columns...";
      finalMessage = "Here is the information about the columns:";

      const infoMessages = Object.keys(filteredContent[0]).map(key => {
        const nonNullValues = filteredContent
          .map(row => row[key])
          .filter(value => value !== null && value !== "").length;
        return `Column: ${key}, Non-null Count: ${nonNullValues}, Data Type: ${typeof filteredContent[0][key]}`;
      });

      setAwaitingColumnInput(true);
      setAwaitingTypeChange(false);

      setMessages((prevMessages) => [
        ...prevMessages,
        { type: "bot", text: initialMessage },
        { type: "bot", text: finalMessage },
        ...infoMessages.map(info => ({ type: "bot", text: info })),
        {
          type: "bot",
          text: "If you want to change the data type of any column, write it as - {column name} : {dtype:}, or type 'no' to skip."
        }
      ]);
    } else if (message === "Handle NA") {
      initialMessage = "Handling NA values...";

      updatedContent = updatedContent.filter(row => {
        const hasNull = Object.values(row).some(value => value === null || value === "");
        return !hasNull;
      });

      finalMessage = updatedContent.length < filteredContent.length ? "Great! Null values handled." : "No null values present.";

      setFilteredContent(updatedContent);
      dispatch(updateFile({ name: file.name, content: updatedContent }));

      setMessages((prevMessages) => [
        ...prevMessages,
        { type: "bot", text: initialMessage },
        { type: "bot", text: finalMessage },
        { type: "bot", text: "Please select an option from the dropdown below." }
      ]);
    } else if (message === "Remove Duplicates") {
      initialMessage = "Removing duplicate rows...";

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

      finalMessage = updatedContent.length < filteredContent.length ? "Great! Duplicates removed." : "No duplicates found.";

      setFilteredContent(updatedContent);
      dispatch(updateFile({ name: file.name, content: updatedContent }));

      setMessages((prevMessages) => [
        ...prevMessages,
        { type: "bot", text: initialMessage },
        { type: "bot", text: finalMessage },
        { type: "bot", text: "Please select an option from the dropdown below." }
      ]);
    } else if (message === "Remove Outliers") {
      initialMessage = "Detecting outliers in the data...";
      const columnsWithOutliers = {};

      columns.forEach(col => {
        const outliersInColumn = detectOutliers(filteredContent, col);
        if (outliersInColumn.length > 0) {
          columnsWithOutliers[col] = outliersInColumn;
        }
      });

      if (Object.keys(columnsWithOutliers).length > 0) {
        const outlierMessages = Object.entries(columnsWithOutliers).map(([col, outliers]) => {
          return `Column: ${col}, Outliers: ${outliers.join(", ")}`;
        });

        setOutliers(columnsWithOutliers);
        setAwaitingOutlierConfirmation(true);

        setMessages((prevMessages) => [
          ...prevMessages,
          { type: "bot", text: initialMessage },
          ...outlierMessages.map(msg => ({ type: "bot", text: msg })),
          { type: "bot", text: "Do you want to remove these outliers? Type 'yes' to remove or 'no' to skip." }
        ]);
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: "bot", text: "No outliers detected in the data." },
          { type: "bot", text: "Please select an option from the dropdown below." }
        ]);
      }
    } else if (awaitingOutlierConfirmation) {
      if (message.toLowerCase() === "yes") {
        initialMessage = "Removing outliers from the data...";
        updatedContent = filteredContent.filter(row => {
          return !Object.keys(outliers).some(col => outliers[col].includes(row[col]));
        });

        finalMessage = "Outliers removed.";

        setFilteredContent(updatedContent);
        setOutliers([]);
        setAwaitingOutlierConfirmation(false);

        dispatch(updateFile({ name: file.name, content: updatedContent }));
      

        setMessages((prevMessages) => [
          ...prevMessages,
          { type: "bot", text: initialMessage },
          { type: "bot", text: finalMessage },
          { type: "bot", text: "Please select an option from the dropdown below." }
        ]);
      } else if (message.toLowerCase() === "no") {
        setAwaitingOutlierConfirmation(false);
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: "bot", text: "Outliers not removed." },
          { type: "bot", text: "Please select an option from the dropdown below." }
        ]);
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: "bot", text: "Invalid input. Please type 'yes' or 'no'." }
        ]);
      }
    } else if (message === "Scale Columns") {
      initialMessage = "Listing numerical columns for scaling...";
      const numericalCols = columns.filter(col => {
        return filteredContent.every(row => typeof row[col] === 'number');
      });

      if (numericalCols.length > 0) {
        setNumericalColumns(numericalCols);

        const numericalMessages = numericalCols.map((col, index) => {
          return `${index + 1}. ${col}`;
        });

        setMessages((prevMessages) => [
          ...prevMessages,
          { type: "bot", text: initialMessage },
          ...numericalMessages.map(msg => ({ type: "bot", text: msg })),
          { type: "bot", text: "Please enter the names of the columns you want to scale, separated by commas." }
        ]);

        dispatch(updateFile({ name: file.name, content: updatedContent }));
      

        setAwaitingColumnInput(true);
        setScalingColumns(true);
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: "bot", text: "No numerical columns found to scale." },
          { type: "bot", text: "Please select an option from the dropdown below." }
        ]);
      }
    } else {
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: "bot", text: "Invalid option. Please select an option from the dropdown below." }
      ]);
    }
  };

  

  const handleDeleteRow = (indexToDelete) => {
    // Filter out the row that needs to be deleted
    const updatedContent = filteredContent.filter((_, index) => index !== indexToDelete);
  
    // Update the local state with the new content
    setFilteredContent(updatedContent);
  
    // Dispatch the updated content to Redux
    dispatch(updateFile(file.name, updatedContent));
  };

  const handleCellChange = (rowIndex, fieldName, newValue) => {
    // Create a copy of the existing data (assuming your data is stored in an array of objects)
    const updatedData = [...filteredContent];
    
    // Clone the specific row object before updating
    const updatedRow = { ...updatedData[rowIndex] };
  
    // Now update the value safely
    updatedRow[fieldName] = newValue;
  
    // Replace the modified row back into the updated data array
    updatedData[rowIndex] = updatedRow;
  
    // Set the state with the new data
    setFilteredContent(updatedData);
  };
  
  

  const handleRowDragEnd = (result) => {
    if (!result.destination) return;

    const newFilteredContent = Array.from(filteredContent);
    const [movedRow] = newFilteredContent.splice(result.source.index, 1);
    newFilteredContent.splice(result.destination.index, 0, movedRow);

    setFilteredContent(newFilteredContent);
    dispatch(updateFile(file.name, newFilteredContent));
  };

  const handleColumnDragEnd = (result) => {
    if (!result.destination) return;

    const newColumns = Array.from(columns);
    const [movedColumn] = newColumns.splice(result.source.index, 1);
    newColumns.splice(result.destination.index, 0, movedColumn);

    const newFilteredContent = filteredContent.map((row) => {
      const newRow = {};
      newColumns.forEach((col) => {
        newRow[col] = row[col];
      });
      return newRow;
    });

    setColumns(newColumns);
    setFilteredContent(newFilteredContent);

    dispatch(updateFile(file.name, newFilteredContent));
  };

  return (
    <div className="etl-module-container">
      <div
        className={`etl-content ${
          isChatOpen ? "with-chat-open" : "with-chat-closed"
        }`}
      >
        {file ? (
          <div>
            <div className="etl-header">
              <button
                type="button"
                className="btn btn-primary"
                onClick={backBtn}
              >
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
            {Array.isArray(filteredContent) && filteredContent.length > 0 ? (
              <DragDropContext onDragEnd={handleRowDragEnd}>
              <Droppable droppableId="droppable-rows">
                {(provided) => (
                  <table className="file-table" ref={provided.innerRef} {...provided.droppableProps}>
                    <thead>
                      <tr>
                        {columns.map((col, index) => (
                          <th key={col}>{col}</th>
                        ))}
                        <th>Delete</th> {/* Column for delete button */}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredContent.map((row, rowIndex) => (
                        <Draggable key={rowIndex} draggableId={`row-${rowIndex}`} index={rowIndex}>
                          {(provided) => (
                            <tr ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                              {columns.map((col) => (
                                <td key={col}>
                                  <input
                                    type="text"
                                    value={row[col]}
                                    onChange={(e) => handleCellChange(rowIndex, col, e.target.value)} // Editable cell
                                  />
                                </td>
                              ))}
                              <td>
                                <button
                                  type="button"
                                  className="delete-row-btn"
                                  onClick={() => handleDeleteRow(rowIndex)}
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </tbody>
                  </table>
                )}
              </Droppable>
            </DragDropContext>
            ) : (
              <p>No data available</p>
            )}
          </div>
        ) : (
          <p>No file selected</p>
        )}
        <button
          className={`reopen-chat-btn ${isChatOpen ? "hidden" : "visible"}`}
          onClick={() => setIsChatOpen(true)}
        >
          Reopen Chat
        </button>
      </div>
      {isChatOpen && (
        <ChatSidebar
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          onSend={handleSendMessage}
          options={[
            "Handle NA",
            "Remove Duplicates",
            "Show Info About Columns",
            "Remove Outliers",
            "Scale Columns",
            "Exit",
          ]}
          messages={messages}
          awaitingColumnInput={awaitingColumnInput}
          awaitingTypeChange={awaitingTypeChange}
          awaitingOutlierConfirmation={awaitingOutlierConfirmation}
        />
      )}
    </div>
  );
};

export default ETLModule;

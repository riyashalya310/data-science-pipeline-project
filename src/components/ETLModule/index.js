import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FaArrowRight } from "react-icons/fa";
import { IoMdArrowBack } from "react-icons/io";
import ChatSidebar from "../SideBar";
import { updateColumnType, updateFile } from "../../store/slices/userSlice";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import "./index.css";

// Utility function to calculate Q1, Q3, and IQR
const quantiles = (data) => {
  const sortedData = [...data].sort((a, b) => a - b);
  const n = sortedData.length;

  const Q1 = sortedData[Math.floor(n / 4)];
  const Q3 = sortedData[Math.floor((3 * n) / 4)];
  const IQR = Q3 - Q1;

  return { Q1, Q3, IQR };
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
  const [awaitingOutlierColumns, setAwaitingOutlierColumns] = useState(false);
  const [
    awaitingNullDeletionConfirmation,
    setAwaitingNullDeletionConfirmation,
  ] = useState(false);
  const [nullRows, setNullRows] = useState([]);
  const [highlightedRows, setHighlightedRows] = useState([]);
  const [awaitingCategoricalColumn, setAwaitingCategoricalColumn] =
    useState(false);
  const [selectedCategoricalColumn, setSelectedCategoricalColumn] =
    useState("");
  const [awaitingEncodingMethod, setAwaitingEncodingMethod] = useState(false);
  const [categoricalColumns, setCategoricalColumns] = useState([]);

  const dispatch = useDispatch();

  const [table, setTable] = useState(file.content);

  useEffect(() => {
    // Function to add the index column
    const addIndexColumn = (data) => {
      return data.map((row, index) => ({
        index: index + 1, // Index starts at 1
        ...row,
      }));
    };

    // Update table with the new index column
    const tableWithIndex = addIndexColumn(file.content);
    setTable(tableWithIndex);
  }, [file.name]);

  useEffect(() => {
    console.log(
      "Awaiting Outlier Confirmation State:",
      awaitingOutlierConfirmation
    );
  }, [awaitingOutlierConfirmation]);

  useEffect(() => {
    console.log("Table updated:", table);
  }, [table]);

  dispatch(updateFile({ name: file.name, content: table }));

  const [filteredContent, setFilteredContent] = useState(table ? table : []);

  const moveToAnalysisBtn = () => {
    const { history } = props;
    history.push("/view");
  };

  const backBtn = () => {
    const { history } = props;
    history.push("/");
  };

  const handleExit = () => {
    setIsChatOpen(false);
  };

  const handleSendMessage = async (message) => {
    let updatedContent = [...filteredContent];
    let initialMessage = "";
    let finalMessage = "";

    // Log the user input
    setMessages((prevMessages) => [
      ...prevMessages,
      { type: "user", text: message },
    ]);

    if (message.toLowerCase() === "encode categorical columns") {
      const categoricalColumns = Object.keys(filteredContent[0]).filter(
        (col) => typeof filteredContent[0][col] === "string"
      );

      if (categoricalColumns.length > 0) {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            type: "bot",
            text: `The following are the categorical columns: ${categoricalColumns.join(
              ", "
            )}`,
          },
          {
            type: "bot",
            text: "Please select one categorical column from the dropdown.",
          },
        ]);
        setAwaitingCategoricalColumn(true);
        setCategoricalColumns(categoricalColumns); // <-- Make sure you set this
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: "bot", text: "No categorical columns found in the data." },
        ]);
      }
      return;
    }

    // Step 2: Column selection
    if (awaitingCategoricalColumn) {
      const selectedColumn = message.trim();
      const categoricalColumns = Object.keys(filteredContent[0]).filter(
        (col) => typeof filteredContent[0][col] === "string"
      );

      if (categoricalColumns.includes(selectedColumn)) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: "bot", text: `You selected the column: ${selectedColumn}` },
          {
            type: "bot",
            text: "There are several encoding methods available: \n\n1. One-hot Encoding: Creates a new binary column for each category.\n\n2. Label Encoding: Assigns a unique integer to each category.\n\n3. Ordinal Encoding: Similar to Label Encoding but assumes an order.\n\nPlease select an encoding method from the dropdown.",
          },
        ]);
        setSelectedCategoricalColumn(selectedColumn); // Store the selected column
        setAwaitingEncodingMethod(true); // Move to encoding method selection
        setAwaitingCategoricalColumn(false);
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: "bot", text: "Invalid column. Please try again." },
        ]);
      }
      return;
    }

    // Step 3: Encoding method selection
    if (awaitingEncodingMethod) {
      const encodingMethod = message.trim().toLowerCase();

      const validEncodings = [
        "one-hot encoding",
        "label encoding",
        "ordinal encoding",
      ];

      if (validEncodings.includes(encodingMethod)) {
        initialMessage = `Applying ${encodingMethod} to the column: ${selectedCategoricalColumn}`;

        let encodedContent = [...updatedContent];

        if (encodingMethod === "one-hot encoding") {
          // Implement One-hot Encoding
          const uniqueValues = [
            ...new Set(
              encodedContent.map((row) => row[selectedCategoricalColumn])
            ),
          ];
          encodedContent = encodedContent.map((row) => {
            const newRow = { ...row };
            uniqueValues.forEach((value) => {
              newRow[`${selectedCategoricalColumn}_${value}`] =
                row[selectedCategoricalColumn] === value ? 1 : 0;
            });
            delete newRow[selectedCategoricalColumn];
            return newRow;
          });
          finalMessage = `One-hot encoding applied to column ${selectedCategoricalColumn}.`;
        } else if (encodingMethod === "label encoding") {
          // Implement Label Encoding
          const uniqueValues = [
            ...new Set(
              encodedContent.map((row) => row[selectedCategoricalColumn])
            ),
          ];
          const labelMap = uniqueValues.reduce((acc, value, index) => {
            acc[value] = index;
            return acc;
          }, {});
          encodedContent = encodedContent.map((row) => ({
            ...row,
            [selectedCategoricalColumn]:
              labelMap[row[selectedCategoricalColumn]],
          }));
          finalMessage = `Label encoding applied to column ${selectedCategoricalColumn}.`;
        } else if (encodingMethod === "ordinal encoding") {
          // Implement Ordinal Encoding
          const uniqueValues = [
            ...new Set(
              encodedContent.map((row) => row[selectedCategoricalColumn])
            ),
          ];
          const ordinalMap = uniqueValues.reduce((acc, value, index) => {
            acc[value] = index + 1; // Start from 1
            return acc;
          }, {});
          encodedContent = encodedContent.map((row) => ({
            ...row,
            [selectedCategoricalColumn]:
              ordinalMap[row[selectedCategoricalColumn]],
          }));
          finalMessage = `Ordinal encoding applied to column ${selectedCategoricalColumn}.`;
        }

        // Update the table and state with encoded data
        setFilteredContent(encodedContent);
        setTable(encodedContent);
        console.log(encodedContent);
        console.log(table);
        dispatch(updateFile({ name: file.name, content: encodedContent }));

        setMessages((prevMessages) => [
          ...prevMessages,
          { type: "bot", text: initialMessage },
          { type: "bot", text: finalMessage },
          {
            type: "bot",
            text: "Please select an option from the dropdown below.",
          },
        ]);

        setAwaitingEncodingMethod(false); // Exit encoding method selection
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: "bot", text: "Invalid encoding method. Please try again." },
        ]);
      }
      return;
    }

    // Handle null/empty row deletion confirmation
    if (awaitingNullDeletionConfirmation) {
      if (message.toLowerCase() === "yes") {
        // User confirmed to delete rows with null/empty values
        const updatedContentWithoutNulls = updatedContent.filter((row) => {
          return !Object.values(row).some(
            (value) => value === null || value === ""
          );
        });

        finalMessage = "Rows with null/empty values have been deleted.";

        setFilteredContent(updatedContentWithoutNulls);
        setTable(updatedContentWithoutNulls);
        dispatch(
          updateFile({ name: file.name, content: updatedContentWithoutNulls })
        );

        setMessages((prevMessages) => [
          ...prevMessages,
          { type: "bot", text: finalMessage },
          {
            type: "bot",
            text: "Please select an option from the dropdown below.",
          },
        ]);
      } else if (message.toLowerCase() === "no") {
        // User opted not to delete the rows
        finalMessage = "Rows with null/empty values were not deleted.";
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: "bot", text: finalMessage },
          {
            type: "bot",
            text: "Please select an option from the dropdown below.",
          },
        ]);
      } else {
        // Invalid input, stay in the confirmation state
        finalMessage = "Invalid input. Please type 'yes' or 'no'.";
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: "bot", text: finalMessage },
        ]);
        return; // Exit function to wait for valid input
      }

      // Reset confirmation state after handling
      setAwaitingNullDeletionConfirmation(false);
      setNullRows([]); // Reset nullRows state
      return;
    }

    if (awaitingOutlierConfirmation) {
      if (message.toLowerCase() === "yes") {
        // Prompt for column names to remove outliers
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            type: "bot",
            text: "Type the name of the columns separated by spaces according to which you want to remove outliers, or type 'all' to remove outliers from all columns.",
          },
        ]);

        setAwaitingOutlierColumns(true); // Switch to the column input phase
        setAwaitingOutlierConfirmation(false); // Exit the outlier confirmation state
      } else if (message.toLowerCase() === "no") {
        finalMessage = "Outliers were not removed.";
        setAwaitingOutlierConfirmation(false);

        setMessages((prevMessages) => [
          ...prevMessages,
          { type: "bot", text: finalMessage },
          {
            type: "bot",
            text: "Please select an option from the dropdown below.",
          },
        ]);

        setOutliers({}); // Reset outliers after processing
      } else {
        finalMessage = "Invalid input. Please type 'yes' or 'no'.";
        setAwaitingOutlierConfirmation(true); // Stay in outlier confirmation state
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: "bot", text: finalMessage },
        ]);
      }

      return; // Exit the function after handling outliers
    }

    if (awaitingOutlierColumns) {
      const input = message.toLowerCase().trim();

      if (input === "all") {
        initialMessage = "Removing outliers from all columns...";

        // Remove rows that contain outliers in any column
        const updatedContentWithoutOutliers = filteredContent.filter((row) => {
          return !columns.some((col) => {
            return outliers[col] && outliers[col].includes(row[col]);
          });
        });

        console.log(
          "Updated Content Without Outliers (All):",
          updatedContentWithoutOutliers
        );

        setFilteredContent(updatedContentWithoutOutliers);
        setTable(updatedContentWithoutOutliers);
        dispatch(
          updateFile({
            name: file.name,
            content: updatedContentWithoutOutliers,
          })
        );

        finalMessage = "Outliers removed from all columns.";
      } else {
        // Split the user input to get selected column names
        const selectedColumns = input.split(" ").map((col) => col.trim());
        initialMessage = `Removing outliers from the columns: ${selectedColumns.join(
          ", "
        )}`;
        console.log(`Selected columns : ${selectedColumns}`);

        // Remove rows that contain outliers in the specified columns
        const updatedContentWithoutOutliers = filteredContent.filter((row) => {
          let keepRow = true;

          console.log("Current Row:", row);

          // Normalize selectedColumns to lower case for comparison
          const normalizedSelectedColumns = selectedColumns.map((col) =>
            col.toLowerCase()
          );

          for (const col of normalizedSelectedColumns) {
            // Normalize actual column names in outliers and row for comparison
            const actualCol = Object.keys(outliers).find(
              (key) => key.toLowerCase() === col
            );

            if (actualCol && row[actualCol] !== undefined) {
              const cellValue = String(row[actualCol]).trim();
              const outlierValues = outliers[actualCol].map((value) =>
                String(value).trim()
              );

              console.log(`Checking Column: ${actualCol}`);
              console.log(`Cell Value: '${cellValue}'`);
              console.log(`Outlier Values: ${outlierValues}`);

              if (outlierValues.includes(cellValue)) {
                keepRow = false;
                console.log(
                  `Row excluded due to outlier in column '${actualCol}': ${cellValue}`
                );
                break;
              }
            } else {
              console.log(`Column '${col}' does not exist in outliers or row.`);
            }
          }

          return keepRow;
        });

        // Logging the filtered content
        console.log(
          "Updated Content Without Outliers:",
          updatedContentWithoutOutliers
        );

        // Update state and dispatch the action
        setFilteredContent(updatedContentWithoutOutliers);
        setTable(updatedContentWithoutOutliers);
        dispatch(
          updateFile({
            name: file.name,
            content: updatedContentWithoutOutliers,
          })
        );

        finalMessage = `Outliers removed from columns: ${selectedColumns.join(
          ", "
        )}.`;
      }

      // Send bot messages
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: "bot", text: initialMessage },
        { type: "bot", text: finalMessage },
        {
          type: "bot",
          text: "Please select an option from the dropdown below.",
        },
      ]);

      setOutliers({}); // Reset outliers after processing
      setAwaitingOutlierColumns(false); // Exit the outlier column input state
      return;
    }

    if (awaitingColumnInput) {
      if (message.toLowerCase() === "no") {
        setAwaitingColumnInput(false);
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: "bot", text: "No changes made." },
          {
            type: "bot",
            text: "Please select an option from the dropdown below.",
          },
        ]);
        return;
      }

      // Handling column scaling if awaiting for column names
      if (scalingColumns) {
        const selectedColumns = message.split(",").map((name) => name.trim());
        const columnsToScale = selectedColumns.filter((name) =>
          numericalColumns.includes(name)
        );

        if (columnsToScale.length > 0) {
          initialMessage = "Scaling selected columns...";
          const scaledContent = filteredContent.map((row) => {
            const newRow = { ...row };
            columnsToScale.forEach((col) => {
              const values = filteredContent
                .map((r) => r[col])
                .filter((v) => typeof v === "number");
              const colMean = mean(values);
              const colStdDev = stdDev(values);
              newRow[col] = zScoreScale(row[col], colMean, colStdDev).toFixed(
                2
              );
            });
            return newRow;
          });

          finalMessage = "Columns scaled.";

          setFilteredContent(scaledContent);
          setTable(scaledContent);
          setAwaitingColumnInput(false);
          setScalingColumns(false);

          dispatch(updateFile({ name: file.name, content: table }));

          setMessages((prevMessages) => [
            ...prevMessages,
            { type: "bot", text: initialMessage },
            { type: "bot", text: finalMessage },
            {
              type: "bot",
              text: "Please select an option from the dropdown below.",
            },
          ]);
        } else {
          finalMessage = "Invalid column names. No columns scaled.";
          setMessages((prevMessages) => [
            ...prevMessages,
            { type: "bot", text: finalMessage },
          ]);
        }
        return;
      }

      // Handling other types of column input
      const [columnName, dtype] = message.split(":").map((item) => item.trim());

      if (columnName && dtype) {
        initialMessage = `Changing the data type of column '${columnName}' to '${dtype}'...`;

        updatedContent = filteredContent.map((row) => {
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

        dispatch(
          updateColumnType({
            name: file.name,
            columnName: columnName,
            newType: dtype,
          })
        );
        console.log(`Changing dtype - ${file}`);
      } else {
        finalMessage =
          "Invalid format. Please write it as - {column name} : {dtype:}.";
      }

      setMessages((prevMessages) => [
        ...prevMessages,
        { type: "bot", text: initialMessage },
        { type: "bot", text: finalMessage },
        {
          type: "bot",
          text: "Please select an option from the dropdown below.",
        },
      ]);
    } else if (message === "Show Info About Columns") {
      initialMessage = "Gathering information about columns...";
      finalMessage = "Here is the information about the columns:";

      const infoMessages = Object.keys(filteredContent[0]).map((key) => {
        const nonNullValues = filteredContent
          .map((row) => row[key])
          .filter((value) => value !== null && value !== "").length;
        return `Column: ${key}, Non-null Count: ${nonNullValues}, Data Type: ${typeof filteredContent[0][
          key
        ]}`;
      });

      setAwaitingColumnInput(true);
      setAwaitingTypeChange(false);

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
    } else if (message === "Provide a snapshot of the data") {
      const initialMessage = "Fetching a snapshot of the data...";

      // Show the first 5 rows of the data as a snapshot
      const snapshot = filteredContent.slice(0, 5);
      const tableHeaders = Object.keys(filteredContent[0]);

      // Create table for the data snapshot
      let snapshotTable = `<table border="1" cellpadding="5" cellspacing="0"><thead><tr>`;
      tableHeaders.forEach((header) => {
        snapshotTable += `<th>${header}</th>`;
      });
      snapshotTable += `</tr></thead><tbody>`;

      // Generate rows for the snapshot table
      snapshot.forEach((row) => {
        snapshotTable += `<tr>`;
        tableHeaders.forEach((key) => {
          snapshotTable += `<td>${row[key] !== undefined ? row[key] : ""}</td>`; // Handle undefined values gracefully
        });
        snapshotTable += `</tr>`;
      });
      snapshotTable += `</tbody></table>`;

      // Provide column info (e.g., name, non-null counts, data types)
      const columnInfo = tableHeaders.map((col) => {
        const nonNullValues = filteredContent.filter(
          (row) => row[col] !== null && row[col] !== ""
        ).length;
        return { col, nonNullValues, dataType: typeof filteredContent[0][col] };
      });

      // Create summary table
      let summaryTable = `
        <table border="1" cellpadding="5" cellspacing="0">
          <thead>
            <tr>
              <th>Column</th>
              <th>Non-null Count</th>
              <th>Data Type</th>
            </tr>
          </thead>
          <tbody>`;

      columnInfo.forEach(({ col, nonNullValues, dataType }) => {
        summaryTable += `
          <tr>
            <td>${col}</td>
            <td>${nonNullValues}</td>
            <td>${dataType}</td>
          </tr>`;
      });

      summaryTable += `
          </tbody>
        </table>`;

      // Infer domain and sector
      const sectorInfo =
        "This dataset appears to contain general tabular data. It may be applicable to sectors such as finance, healthcare, retail, or other data-driven domains depending on the columns and values.";

      // Send messages to the chat
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: "bot", text: initialMessage },
        { type: "bot", text: "Here is a snapshot of the data:" },
        { type: "bot", text: snapshotTable }, // Sending the snapshot table
        { type: "bot", text: "Column Information:" },
        { type: "bot", text: summaryTable }, // Sending the summary table
        { type: "bot", text: sectorInfo },
        {
          type: "bot",
          text: "Please select an option from the dropdown below.",
        },
      ]);

      return; // Exit after handling this option
    } else if (message === "Remove NA/Null/Empty Values") {
      initialMessage = "Checking for rows with null/empty values...";

      // Identify rows with null or empty values
      const rowsWithNulls = filteredContent.filter((row) => {
        return Object.values(row).some(
          (value) => value === null || value === ""
        );
      });

      if (rowsWithNulls.length > 0) {
        const nullRowIndices = rowsWithNulls.map((_, index) => index); // Store indices of rows with null values
        setNullRows(rowsWithNulls); // Store rows with nulls
        setHighlightedRows(nullRowIndices); // Highlight rows with nulls
        setAwaitingNullDeletionConfirmation(true); // Set state to wait for confirmation

        // Show the rows with null/empty values in chat
        const nullRowMessages = rowsWithNulls.map(
          (row, index) => `Row ${index + 1}: ${JSON.stringify(row)}`
        );
        finalMessage = `Found ${rowsWithNulls.length} rows with null/empty values. Do you want to delete them? Type 'yes' or 'no'.`;

        setMessages((prevMessages) => [
          ...prevMessages,
          { type: "bot", text: initialMessage },
          ...nullRowMessages.map((msg) => ({ type: "bot", text: msg })),
          { type: "bot", text: finalMessage },
        ]);
      } else {
        // No null values found
        finalMessage = "No rows with null/empty values found.";
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: "bot", text: finalMessage },
          {
            type: "bot",
            text: "Please select an option from the dropdown below.",
          },
        ]);
      }
      return; // Exit to wait for user confirmation
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

      finalMessage =
        updatedContent.length < filteredContent.length
          ? "Great! Duplicates removed."
          : "No duplicates found.";

      setFilteredContent(updatedContent);
      setTable(updatedContent);
      dispatch(updateFile({ name: file.name, content: table }));

      setMessages((prevMessages) => [
        ...prevMessages,
        { type: "bot", text: initialMessage },
        { type: "bot", text: finalMessage },
        {
          type: "bot",
          text: "Please select an option from the dropdown below.",
        },
      ]);
    } else if (message === "Remove Outliers") {
      initialMessage = "Detecting outliers in the data...";
      const columnsWithOutliers = {};

      // Detect outliers in each column
      columns.forEach((col) => {
        const values = filteredContent
          .map((row) => row[col])
          .filter((v) => typeof v === "number"); // Get numerical values
        const { Q1, Q3, IQR } = quantiles(values); // Get Q1, Q3, IQR
        const threshold_high = Q3 + 1.5 * IQR;
        const threshold_low = Q1 - 1.5 * IQR;

        const outliersInColumn = values.filter(
          (value) => value < threshold_low || value > threshold_high
        );
        if (outliersInColumn.length > 0) {
          columnsWithOutliers[col] = outliersInColumn;
        }
      });

      if (Object.keys(columnsWithOutliers).length > 0) {
        setAwaitingOutlierConfirmation(true);
        setOutliers(columnsWithOutliers); // Store outliers for later use

        const outlierMessages = Object.entries(columnsWithOutliers).map(
          ([col, outliers]) => {
            return `Column: ${col}, Outliers: ${outliers.join(", ")}`;
          }
        );

        setMessages((prevMessages) => [
          ...prevMessages,
          { type: "bot", text: initialMessage },
          ...outlierMessages.map((msg) => ({ type: "bot", text: msg })),
          {
            type: "bot",
            text: "Outliers are highlighted. Do you want to remove them? Type 'yes' or 'no'.",
          },
        ]);
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: "bot", text: "No outliers detected in the data." },
          {
            type: "bot",
            text: "Please select an option from the dropdown below.",
          },
        ]);
      }
    } else if (message === "Scale Columns") {
      initialMessage = "Listing numerical columns for scaling...";
      const numericalCols = columns.filter((col) => {
        return filteredContent.every((row) => typeof row[col] === "number");
      });

      if (numericalCols.length > 0) {
        setNumericalColumns(numericalCols);

        const numericalMessages = numericalCols.map((col, index) => {
          return `${index + 1}. ${col}`;
        });

        setMessages((prevMessages) => [
          ...prevMessages,
          { type: "bot", text: initialMessage },
          ...numericalMessages.map((msg) => ({ type: "bot", text: msg })),
          {
            type: "bot",
            text: "Do you want to scale columns? Please enter the names of the columns you want to scale, separated by commas else type 'no' to skip.",
          },
        ]);

        setTable(updatedContent);
        dispatch(updateFile({ name: file.name, content: table }));

        setAwaitingColumnInput(true);
        setScalingColumns(true);
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: "bot", text: "No numerical columns found to scale." },
          {
            type: "bot",
            text: "Please select an option from the dropdown below.",
          },
        ]);
      }
    } else if (message === "Exit") {
      handleExit();
    } else {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          type: "bot",
          text: "Invalid option. Please select an option from the dropdown below.",
        },
      ]);
    }
  };

  const handleDeleteRow = (indexToDelete) => {
    // Filter out the row that needs to be deleted
    const updatedContent = filteredContent.filter(
      (_, index) => index !== indexToDelete
    );

    // Update the local state with the new content
    setFilteredContent(updatedContent);
    setTable(updatedContent);
    dispatch(updateFile({ name: file.name, content: table }));
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
    console.log(table);
    setTable(updatedData);
    dispatch(updateFile({ name: file.name, content: table }));
  };

  const handleRowDragEnd = (result) => {
    if (!result.destination) return;

    const newFilteredContent = Array.from(filteredContent);
    const [movedRow] = newFilteredContent.splice(result.source.index, 1);
    newFilteredContent.splice(result.destination.index, 0, movedRow);

    setFilteredContent(newFilteredContent);
    setTable(newFilteredContent);
    dispatch(updateFile({ name: file.name, content: table }));
  };

  return (
    <>
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
                  style={{ marginRight: "40px" }}
                >
                  Final View
                  <FaArrowRight />
                </button>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginBottom: "0",
                }}
              >
                <p
                  style={{
                    marginRight: "40px",
                    borderStyle: "solid",
                    borderWidth: "1px",
                    backgroundColor: "black",
                    color: "white",
                    borderRadius: "5px",
                    padding: "5px",
                  }}
                >
                  Total records : {file.content.length}
                </p>
              </div>
              {Array.isArray(filteredContent) && filteredContent.length > 0 ? (
                <DragDropContext onDragEnd={handleRowDragEnd}>
                  <Droppable droppableId="droppable-rows">
                    {(provided) => (
                      <table
                        className="file-table"
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        <thead>
                          <tr>
                            <th>Index</th>
                            {columns.map((col, index) => (
                              <th key={col}>{col}</th>
                            ))}
                            <th>Delete</th> {/* Column for delete button */}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredContent.map((row, rowIndex) => (
                            <Draggable
                              key={rowIndex}
                              draggableId={`row-${rowIndex}`}
                              index={rowIndex}
                            >
                              {(provided) => (
                                <tr
                                  key={rowIndex}
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  <td>{rowIndex}</td>
                                  {columns.map((col) => (
                                    <td
                                      key={col}
                                      className={
                                        outliers[col] &&
                                        outliers[col].includes(row[col])
                                          ? "highlight-outlier"
                                          : ""
                                      }
                                    >
                                      <input
                                        type="text"
                                        value={row[col]}
                                        onChange={(e) =>
                                          handleCellChange(
                                            rowIndex,
                                            col,
                                            e.target.value
                                          )
                                        }
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
              "Provide a snapshot of the data",
              "Remove NA/Null/Empty Values",
              "Remove Duplicates",
              "Show Info About Columns",
              "Remove Outliers",
              "Scale Columns",
              "Encode Categorical Columns",
              "Exit",
            ]}
            messages={messages}
            awaitingColumnInput={awaitingColumnInput}
            awaitingTypeChange={awaitingTypeChange}
            awaitingOutlierConfirmation={awaitingOutlierConfirmation}
            awaitingOutlierColumns={awaitingOutlierColumns}
            awaitingNullDeletionConfirmation={awaitingNullDeletionConfirmation}
            awaitingCategoricalColumn={awaitingCategoricalColumn}
            awaitingEncodingMethod={awaitingEncodingMethod}
            selectedCategoricalColumn={selectedCategoricalColumn}
            categoricalColumns={categoricalColumns}
          />
        )}
      </div>
    </>
  );
};

export default ETLModule;

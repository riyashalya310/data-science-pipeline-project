import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Joyride from "react-joyride";
import { FaArrowRight } from "react-icons/fa";
import { MdOutlineTour } from "react-icons/md";
import { IoMdArrowBack } from "react-icons/io";
import ChatSidebar from "../SideBar";
import {
  updateColumnType,
  updateFile,
  updateCategoricalColumns,
  updateOriginalCategories,
} from "../../store/slices/userSlice";
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

  console.log(file);

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
  const [awaitingScaleColumn, setAwaitingScaleColumn] = useState(false);
  const [numericalColumns, setNumericalColumns] = useState([]);
  const [outlierColumns, setOutlierColumns] = useState([]);
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
  const [originalColumnTypes, setOriginalColumnTypes] = useState({});
  const [preprocessedData, setPreprocessedData] = useState(file.content);
  const [awaitingScalingMethod,setAwaitingScalingMethod]=useState("");

  const dispatch = useDispatch();
  const [tourActive, setTourActive] = useState(false);

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

  // const expectedColumnTypes = {
  //   Index: "number",
  //   Code: "number", // Replace with the expected data types for your columns
  //   Birthplace: "string",
  //   Census_night_population_count: "number",
  //   Census_usually_resident_population_count: "number",
  // };

  // const checkColumnTypes = () => {
  //   if (!file || !file.columnTypes) {
  //     console.log("File not found or column types not initialized");
  //     return;
  //   }

  //   for (const [column, expectedType] of Object.entries(expectedColumnTypes)) {
  //     const actualType = file.columnTypes[column];

  //     if (actualType !== expectedType) {
  //       console.log(
  //         `Data type mismatch for column ${column}: expected ${expectedType}, but got ${actualType}`
  //       );
  //     } else {
  //       console.log(
  //         `Data type for column ${column} is as expected: ${actualType}`
  //       );
  //     }
  //   }
  // };

  // useEffect(() => {
  //   checkColumnTypes();
  // }, [filteredContent]); // Run type check after filteredContent updates

  // A helper to determine if a column should be considered categorical or numerical
  const inferColumnType = (column) => {
    const sampleValues = filteredContent.map((row) => row[column]).slice(0, 10); // Take a sample for efficiency
    const areAllStrings = sampleValues.every((val) => typeof val === "string");
    const areAllNumbers = sampleValues.every(
      (val) => !isNaN(parseFloat(val)) && isFinite(val)
    );
    return areAllStrings ? "string" : areAllNumbers ? "number" : "mixed";
  };

  // Function to initialize column types based on input file
  const initializeColumnTypes = () => {
    const initialTypes = {};
    Object.keys(filteredContent[0]).forEach((col) => {
      initialTypes[col] = inferColumnType(col);
    });
    setOriginalColumnTypes(initialTypes);
  };

  // Call this function after loading a new file
  useEffect(() => {
    initializeColumnTypes();
  }, [filteredContent]);


  const updatePreprocessedData = (newData) => {
    setPreprocessedData(newData); // Update the preprocessed data
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
      // Check if each column has only string data in all rows
      console.log(originalColumnTypes);

      // Filter columns that have string data type
      const categoricalColumns = Object.keys(originalColumnTypes).filter(
        (col) => originalColumnTypes[col] === "string"
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
        setCategoricalColumns(categoricalColumns); // <-- Store categorical columns in state

        // Dispatch action to update categorical columns in Redux
        dispatch(
          updateCategoricalColumns({
            name: file.name, // Assuming you're passing the file name
            categoricalColumns: categoricalColumns, // Update categorical columns list in Redux
          })
        );

        // Store the original categories (labels) in Redux
        const originalCategories = categoricalColumns.reduce((acc, column) => {
          // Get unique categories for each categorical column
          const uniqueCategories = [
            ...new Set(filteredContent.map((row) => row[column])),
          ];
          acc[column] = uniqueCategories; // Store unique categories for each column
          return acc;
        }, {});

        console.log("Original Categories: ", originalCategories);

        // Dispatch an action to store original categories in Redux
        dispatch(
          updateOriginalCategories({
            name: file.name,
            originalCategories: originalCategories, // Save original categories in Redux
          })
        );

        // Proceed with encoding categorical columns
        // Assuming encoding process here, you would handle the encoding logic next
        // For instance, you could map the original categories to numerical values
        const encodedCategories = categoricalColumns.reduce((acc, column) => {
          const categories = originalCategories[column];
          const categoryMap = categories.reduce((map, category, index) => {
            map[category] = index; // Assign an encoded value (could be any encoding strategy)
            return map;
          }, {});
          acc[column] = categoryMap; // Store encoded categories for each column
          return acc;
        }, {});

        console.log("Encoded Categories: ", encodedCategories);

        // Optionally: Update Redux with encoded categories if needed
        // Example: Dispatch a new action to store encoded categories in Redux
        dispatch(
          updateCategoricalColumns({
            name: file.name, // File name
            categoricalColumns: encodedCategories, // Store encoded categories mapping
          })
        );
        
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
        updatePreprocessedData(encodedContent);
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
        updatePreprocessedData(updatedContentWithoutNulls);
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
      if (message === "yes") {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            type: "bot",
            text: "Select the column from which to remove outliers, or choose 'All Columns' to remove outliers from all columns.",
          },
        ]);
        setAwaitingOutlierColumns(true);
        setAwaitingOutlierConfirmation(false);
      } else if (message === "no") {
        finalMessage = "Outliers were not removed.";
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: "bot", text: finalMessage },
          {
            type: "bot",
            text: "Please select an option from the dropdown below.",
          },
        ]);
        setAwaitingOutlierConfirmation(false);
        setOutliers({});
      } else {
        finalMessage = "Invalid input. Please select 'yes' or 'no'.";
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: "bot", text: finalMessage },
        ]);
      }
      return;
    }

    // Handling outlier removal for all columns or a specific column
    if (awaitingOutlierColumns) {
      if (message.toLowerCase() === "all") {
        initialMessage = "Removing outliers from all columns...";
        // Filter rows that do not contain outliers in any column
        const filteredData = filteredContent.filter((row) => {
          return Object.keys(outliers).every((col) => {
            const value = row[col];
            return !outliers[col].includes(value);
          });
        });

        // Ensure filtered data columns remain numerical
        const cleanedData = filteredData.map((row) => {
          const newRow = { ...row };
          Object.keys(outliers).forEach((col) => {
            if (!isNaN(newRow[col])) {
              newRow[col] = Number(newRow[col]);
            }
          });
          return newRow;
        });

        setFilteredContent(cleanedData);
        setTable(cleanedData); // Update the table with filtered data
        dispatch(updateFile({ name: file.name, content: cleanedData }));
        updatePreprocessedData(cleanedData);

        finalMessage = "Outliers removed from all columns.";
      } else {
        const selectedColumn = message.trim();
        if (outlierColumns.includes(selectedColumn)) {
          initialMessage = `Removing outliers from column: ${selectedColumn}`;
          // Filter rows that do not contain outliers in the selected column
          const filteredData = filteredContent.filter((row) => {
            const value = row[selectedColumn];
            return !outliers[selectedColumn].includes(value);
          });

          // Ensure the processed column remains numerical
          const cleanedData = filteredData.map((row) => {
            const newRow = { ...row };
            if (!isNaN(newRow[selectedColumn])) {
              newRow[selectedColumn] = Number(newRow[selectedColumn]);
            }
            return newRow;
          });

          setFilteredContent(cleanedData);
          setTable(cleanedData); 
          dispatch(updateFile({ name: file.name, content: cleanedData }));
          updatePreprocessedData(cleanedData);

          finalMessage = `Outliers removed from column: ${selectedColumn}`;
        } else {
          finalMessage = "Invalid column name. No outliers removed.";
        }
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

      setAwaitingOutlierColumns(false);
      setOutliers({});
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
        updatePreprocessedData(updatedContent);
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
    } else if (message === "Column Summary & Editor") {
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
      let snapshotTable = `<table class="data-table" cellpadding="5" cellspacing="0"><thead><tr>`;
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

      // Create column info table (matching the snapshot table's structure and styles)
      let columnInfoTable = `
        <table class="data-table" cellpadding="5" cellspacing="0" style="border: 1px solid #ddd; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="border: 1px solid #ddd;padding: 10px">Column</th>
              <th style="border: 1px solid #ddd;padding: 10px">Non-null Count</th>
              <th style="border: 1px solid #ddd;padding: 10px">Data Type</th>
            </tr>
          </thead>
          <tbody>`;

      columnInfo.forEach(({ col, nonNullValues, dataType }) => {
        columnInfoTable += `
          <tr>
            <td style="border: 1px solid #ddd;padding: 10px">${col}</td>
            <td style="border: 1px solid #ddd;padding: 10px">${nonNullValues}</td>
            <td style="border: 1px solid #ddd;padding: 10px">${dataType}</td>
          </tr>`;
      });

      columnInfoTable += `</tbody></table>`;

      // Wrap the column info table with a div that has overflow-x: auto;
      const columnInfoWithScroll = `<div style="overflow-x: auto; margin: 10px 0; max-width: 100%;">${columnInfoTable}</div>`;

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
        { type: "bot", text: columnInfoWithScroll }, // Sending the column info table wrapped in a div with scroll
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
        finalMessage = `Found ${rowsWithNulls.length} rows with null/empty values. Do you want to delete them?`;

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
      updatePreprocessedData(updatedContent);

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
      const outlier_with_columns = [];

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
          outlier_with_columns.push(col);
        }
      });
      setOutlierColumns(outlier_with_columns);

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
        setAwaitingScaleColumn(true); // Activate dropdown for scaling

        const numericalMessages = numericalCols.map((col, index) => {
          return `${index + 1}. ${col}`;
        });

        setMessages((prevMessages) => [
          ...prevMessages,
          { type: "bot", text: initialMessage },
          ...numericalMessages.map((msg) => ({ type: "bot", text: msg })),
          {
            type: "bot",
            text: "Please select a column to scale.",
          },
        ]);

        setTable(updatedContent);
        updatePreprocessedData(table);
        dispatch(updateFile({ name: file.name, content: table }));
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: "bot", text: "No numerical columns found to scale." },
        ]);
      }
    } else if (awaitingScaleColumn && message) {
      const selectedColumn = message.trim();
      if (numericalColumns.includes(selectedColumn)) {
        initialMessage = "Scaling selected column...";
        const scaledContent = filteredContent.map((row) => {
          const newRow = { ...row };
          const values = filteredContent
            .map((r) => r[selectedColumn])
            .filter((v) => typeof v === "number");

          const colMean = mean(values);
          const colStdDev = stdDev(values);

          // Scale and parse back to number
          newRow[selectedColumn] = parseFloat(
            zScoreScale(row[selectedColumn], colMean, colStdDev).toFixed(2)
          );

          return newRow;
        });

        finalMessage = "Column scaled.";
        setFilteredContent(scaledContent);
        setTable(scaledContent);
        setAwaitingScaleColumn(false); // Reset dropdown state

        dispatch(updateFile({ name: file.name, content: table }));
        updatePreprocessedData(table);

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
        finalMessage = "Invalid column name. No column scaled.";
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: "bot", text: finalMessage },
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

  const steps = [
    {
      target: ".etl-header",
      content: "This is the header of the ETL module.",
      disableBeacon: true,
    },
    {
      target: ".file-name",
      content: "Here you can see the name of the uploaded file.",
      disableBeacon: true,
    },
    {
      target: "#back-button",
      content:
        "This is the button through which you can go back to the Input module.",
        disableBeacon: true,
    },
    {
      target: ".file-table",
      content: "This is the content of the file you just imported.",
      disableBeacon: true,
    },
    {
      target: "#columns-header",
      content: "Here you can see the names of the columns present in the file.",
      disableBeacon: true,
    },
    {
      target: ".chat-content",
      content: "This is the your personal chatbot",
      disableBeacon: true,
    },
    {
      target: ".chat-input-container",
      content: "From here you can give different inputs to the chatbot",
      disableBeacon: true,
    },
    {
      target: "#final-button",
      content:
        "This is the button through which you can go to the next module for final view.",
        disableBeacon: true,
    },
  ];

  const startTour = () => {
    setTourActive(true); 
  };

  steps.forEach((step) => {
    if (!document.querySelector(step.target)) {
      console.warn(`Target not found: ${step.target}`);
    }
  });

  return (
    <>
      <Joyride
        steps={steps}
        continuous
        showProgress
        showSkipButton
        run={tourActive}
        disableBeacon
        callback={(data) => {
          if (data.status === "finished" || data.status === "skipped") {
            setTourActive(false);
          }
        }}
        styles={{
          options: {
            zIndex: 10000,
          },
        }}
      />
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
                  id="back-button"
                >
                  <IoMdArrowBack />
                  Back
                </button>
                <h2 className="file-content-heading">
                  File Content: <span className="file-name">{file.name}</span>
                </h2>
                <button
                  className="start-tour-btn"
                  style={{
                    margin: "10px",
                    height: "35px",
                    textAlign: "center",
                    alignContent: "center",
                    padding: "4px 10px 0 10px",
                    backgroundColor: "rgb(143 89 170)",
                  }}
                  onClick={startTour}
                >
                  Start Tour{"     "}<MdOutlineTour/>
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={moveToAnalysisBtn}
                  style={{ marginRight: "40px" }}
                  id="final-button"
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
                        <thead id="columns-header">
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
              "Column Summary & Editor",
              "Remove Outliers",
              "Scale Columns",
              "Encode Categorical Columns",
              "Exit",
            ]}
            preprocessedData={preprocessedData}
            updatePreprocessedData={updatePreprocessedData}
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
            outlierColumns={outlierColumns}
            numericalColumns={numericalColumns}
            awaitingScaleColumn={awaitingScaleColumn}
            setAwaitingScaleColumn={setAwaitingScaleColumn}
            awaitingScalingMethod={awaitingScalingMethod}
            setAwaitingScalingMethod={setAwaitingScalingMethod}
          />
        )}
      </div>
    </>
  );
};

export default ETLModule;

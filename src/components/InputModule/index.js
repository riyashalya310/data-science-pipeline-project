import React, { useState, useEffect } from "react";
import { withRouter } from "react-router-dom";
import Joyride from "react-joyride";
import Header from "../Header";
import Footer from "../Footer";
import "./index.css";
import { addFile } from "../../store/slices/userSlice";
import { useDispatch } from "react-redux";
import Papa from "papaparse";
import { saveFileToIndexedDB } from "../../utils/indexedDB";

const InputModule = (props) => {
  const [inputMethod, setInputMethod] = useState("");
  const [tourActive, setTourActive] = useState(false);
  const [sampleDatabases, setSampleDatabases] = useState([]);
  const [selectedFile, setSelectedFile] = useState("");
  const [apiUrl, setApiUrl] = useState(""); // State to store the API URL
  const [isFetching, setIsFetching] = useState(false); // State to manage fetch status

  const dispatch = useDispatch();
  const { history } = props;

  const getSteps = (inputMethod) => {
    const baseSteps = [
      {
        target: "h1",
        disableBeacon: true,
        content:
          "Welcome to the ETL module! Here you can integrate, preprocess, and analyze your data.",
      },
      {
        target: "#container",
        disableBeacon: true,
        content:
          "This section provides a detailed explanation of the ETL process and its objectives.",
      },
      {
        target: "select",
        disableBeacon: true,
        content:
          "Select the input method here. You can upload your own file, use sample data, or fetch data from an API.",
      },
    ];

    const conditionalSteps = {
      "upload-yourself": [
        {
          target: "#formFile",
          disableBeacon: true,
          content:
            "If you choose to upload a file, use this section to upload a CSV or JSON file.",
        },
      ],
      "import-sample-data": [
        {
          target: ".dropdown",
          disableBeacon: true,
          content: "This dropdown lets you select and import sample databases.",
        },
      ],
      "fetch-data-from-api": [
        {
          target: "input[type='text']",
          disableBeacon: true,
          content: "Provide an API URL here to fetch data dynamically.",
        },
        {
          target: ".btn",
          disableBeacon: true,
          content:
            "Click this button to submit your selected input and proceed.",
        },
      ],
    };

    return [...baseSteps, ...(conditionalSteps[inputMethod] || [])];
  };

  const steps = getSteps(inputMethod);

  const startTour = () => {
    setTourActive(true);
  };

  useEffect(() => {
    console.log("tourActive changed:", tourActive); // Log whenever `tourActive` changes
  }, [tourActive]);

  useEffect(() => {
    localStorage.removeItem("react-joyride:joyride");
  }, []);

  // Function to process CSV files
  const processCSVFile = async (text, filename) => {
    return new Promise((resolve) => {
      Papa.parse(text, {
        header: true,
        complete: async (result) => {
          const fileData = { name: filename, content: result.data };
          dispatch(addFile(fileData));
          await saveFileToIndexedDB(fileData);
          resolve();
        },
      });
    });
  };

  // Function to process JSON files
  const processJSONFile = async (text, filename) => {
    try {
      const jsonData = JSON.parse(text);
      const fileData = { name: filename, content: jsonData };
      dispatch(addFile(fileData));
      await saveFileToIndexedDB(fileData);
    } catch (error) {
      console.error("Error parsing JSON file:", error);
      alert("Invalid JSON file format.");
    }
  };

  // Function to handle file input
  const onChangeInputFile = async (event) => {
    const file = event.target.files[0];
    const fileExtension = file.name.split(".").pop().toLowerCase();

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;

      // Check the file extension and process accordingly
      if (fileExtension === "csv") {
        await processCSVFile(text, file.name);
      } else if (fileExtension === "json") {
        await processJSONFile(text, file.name);
      } else {
        alert("Please upload a valid CSV or JSON file.");
        return;
      }

      history.replace("/transform"); // Redirect to transform module after file processing
    };

    reader.readAsText(file);
  };

  const fetchSampleDatabases = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/api/sample-files");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setSampleDatabases(data);
    } catch (error) {
      console.error("Error fetching sample databases:", error);
    }
  };

  const handleDatabaseFileSelection = async (event) => {
    const filename = event.target.value;
    setSelectedFile(filename);

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/sample-files/${filename}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/octet-stream",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const blob = await response.blob();
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target.result;
        await processCSVFile(text, filename);

        // Redirect to transform module after file processing
        history.replace("/transform");
      };
      reader.readAsText(blob);
    } catch (error) {
      console.error("Error fetching database file:", error);
    }
  };

  const handleApiDataFetch = async () => {
    setIsFetching(true);
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error("Error fetching data from the API.");
      }
      const data = await response.json();
      const fileData = { name: "API Data", content: data };
      dispatch(addFile(fileData));
      await saveFileToIndexedDB(fileData);
      history.replace("/transform"); // Redirect to transform module
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Error fetching data from the API. Please check the URL.");
    } finally {
      setIsFetching(false);
    }
  };

  const onLogout = () => {
    history.replace("/login");
  };

  useEffect(() => {
    if (inputMethod === "import-sample-data") {
      fetchSampleDatabases();
    }
  }, [inputMethod]);

  return (
    <>
      {tourActive && (
        <Joyride
          steps={steps}
          continuous
          showProgress
          showSkipButton
          run={true}
          disableBeacon={true}
          callback={(data) => {
            console.log(data);
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
      )}

      <Header onLogout={onLogout} startTour={startTour} />
      <div id="container" className="container-fluid">
        <div className="row">
          <div className="col-12">
            <h1>
              Problem Identification: Study of input data belonging to different
              domains
            </h1>
            <h2>Objectives of Building a Data Science Pipeline:</h2>
            <ul>
              <li>
                <strong>Data Integration and Aggregation</strong>
                <ul>
                  <li>
                    <em>Objective:</em> Seamlessly integrate and aggregate data
                    from diverse sources, ensuring it’s structured for analysis.
                  </li>
                  <li>
                    <em>Benefit:</em> Provides a comprehensive and unified view
                    of data, facilitating advanced analysis and accurate
                    insights.
                  </li>
                </ul>
              </li>
              <li>
                <strong>Data Cleaning and Preprocessing</strong>
                <ul>
                  <li>
                    <em>Objective:</em> Standardize, clean, and preprocess data
                    by handling missing values, encoding categorical columns,
                    and transforming features.
                  </li>
                  <li>
                    <em>Benefit:</em> Improves the consistency, reliability, and
                    quality of data, leading to more accurate analysis and model
                    performance.
                  </li>
                </ul>
              </li>
              <li>
                <strong>Exploratory Data Analysis (EDA)</strong>
                <ul>
                  <li>
                    <em>Objective:</em> Provide interactive data analysis
                    through visualizations, including probability distributions
                    of encoded categorical columns and descriptive statistics.
                  </li>
                  <li>
                    <em>Benefit:</em> Helps identify patterns, trends, and
                    anomalies, empowering data-driven decisions and model
                    development.
                  </li>
                </ul>
              </li>
              <li>
                <strong>Scalability</strong>
                <ul>
                  <li>
                    <em>Objective:</em> Design the pipeline to efficiently
                    handle large datasets with complex transformations and
                    computations.
                  </li>
                  <li>
                    <em>Benefit:</em> Ensures that the pipeline can scale
                    seamlessly with growing data volumes while maintaining
                    performance and accuracy.
                  </li>
                </ul>
              </li>
              <li>
                <strong>Flexibility and Modularity</strong>
                <ul>
                  <li>
                    <em>Objective:</em> Build a flexible and modular pipeline
                    that allows easy updates, integration of new data sources,
                    and the inclusion of various analysis techniques.
                  </li>
                  <li>
                    <em>Benefit:</em> Supports evolving business needs, making
                    the pipeline adaptable to new requirements and technologies.
                  </li>
                </ul>
              </li>
              <li>
                <strong>Automation</strong>
                <ul>
                  <li>
                    <em>Objective:</em> Automate key tasks such as ETL (data
                    extraction, transformation, and loading), data
                    visualization, and report generation.
                  </li>
                  <li>
                    <em>Benefit:</em> Reduces manual intervention, streamlines
                    the data processing flow, and accelerates insights
                    generation.
                  </li>
                </ul>
              </li>
              <li>
                <strong>Reproducibility and Auditing</strong>
                <ul>
                  <li>
                    <em>Objective:</em> Ensure that all data processing,
                    analysis, and transformation steps are reproducible and
                    auditable.
                  </li>
                  <li>
                    <em>Benefit:</em> Enhances data integrity and supports
                    transparent, traceable results, making it easier to validate
                    and audit the analysis pipeline.
                  </li>
                </ul>
              </li>
              <li>
                <strong>Real-time Processing</strong>
                <ul>
                  <li>
                    <em>Objective:</em> Incorporate real-time processing
                    capabilities to handle live data streams and perform
                    on-the-fly analytics.
                  </li>
                  <li>
                    <em>Benefit:</em> Enables immediate insights and dynamic
                    decision-making based on the most current data, crucial for
                    time-sensitive operations.
                  </li>
                </ul>
              </li>
              <li>
                <strong>Security and Compliance</strong>
                <ul>
                  <li>
                    <em>Objective:</em> Implement strong security protocols to
                    protect sensitive data and ensure the pipeline complies with
                    relevant data protection laws and regulations.
                  </li>
                  <li>
                    <em>Benefit:</em> Safeguards privacy and ensures compliance,
                    building trust with stakeholders and maintaining ethical
                    standards.
                  </li>
                </ul>
              </li>
              <li>
                <strong>Visualization and Reporting</strong>
                <ul>
                  <li>
                    <em>Objective:</em> Develop advanced data visualizations,
                    summaries, and interactive reports, providing clear insights
                    into the analysis results.
                  </li>
                  <li>
                    <em>Benefit:</em> Facilitates better understanding of data
                    patterns and insights, making it easier for stakeholders to
                    interpret and act upon the findings.
                  </li>
                </ul>
              </li>
              <li>
                <strong>Performance Monitoring and Maintenance</strong>
                <ul>
                  <li>
                    <em>Objective:</em> Establish continuous monitoring to track
                    the pipeline’s performance, ensuring data quality and
                    analysis accuracy.
                  </li>
                  <li>
                    <em>Benefit:</em> Ensures the pipeline operates efficiently
                    with minimal downtime, preventing issues before they impact
                    data processing or analysis.
                  </li>
                </ul>
              </li>
            </ul>

            <h2>Take Input</h2>
            <div>
              <label>Select Input Method:</label>
              <select
                value={inputMethod}
                onChange={(e) => setInputMethod(e.target.value)}
              >
                <option value="">-- Select an option --</option>
                <option value="upload-yourself">
                  Take Input Yourself in CSV/JSON file format
                </option>
                <option value="import-sample-data">Import Sample Data</option>
                <option value="fetch-data-from-api">Fetch Data from API</option>
              </select>
            </div>

            {inputMethod === "upload-yourself" && (
              <form
                id="myForm"
                method="post"
                encType="multipart/form-data"
                className="mb-2"
              >
                <div className="col-12" id="formFile">
                  <div>
                    <div id="label">Select a CSV file for yield inspection</div>
                    <input
                      className="btn"
                      type="file"
                      accept=".csv"
                      onChange={onChangeInputFile}
                    />
                    <div id="helpText">
                      ***Make sure the CSV file follows the correct format.***
                    </div>
                  </div>
                </div>
              </form>
            )}

            {inputMethod === "import-sample-data" && (
              <div>
                <h3>Import from Database:</h3>
                <select
                  className="dropdown"
                  value={selectedFile}
                  onChange={handleDatabaseFileSelection}
                >
                  <option value="">-- Select a sample database --</option>
                  {sampleDatabases.length > 0 ? (
                    sampleDatabases.map((file, index) => (
                      <option key={index} value={file}>
                        {file}
                      </option>
                    ))
                  ) : (
                    <option value="">No sample databases available</option>
                  )}
                </select>
              </div>
            )}

            {inputMethod === "fetch-data-from-api" && (
              <div>
                <h3>Fetch Data from API</h3>
                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="Enter API URL"
                  className="form-control"
                />
                <button
                  className="btn btn-primary mt-2"
                  onClick={handleApiDataFetch}
                  disabled={isFetching}
                >
                  {isFetching ? "Fetching..." : "Submit"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};


export default withRouter(InputModule);
import React, { useState, useEffect } from "react";
import { withRouter } from "react-router-dom";
import Header from "../Header";
import Footer from "../Footer";
import "./index.css";
import { addFile } from "../../store/slices/userSlice";
import { useDispatch } from "react-redux";
import Papa from "papaparse";
import { saveFileToIndexedDB } from "../../utils/indexedDB";

const InputModule = (props) => {
  const [inputMethod, setInputMethod] = useState("");
  const [sampleDatabases, setSampleDatabases] = useState([]);
  const [selectedFile, setSelectedFile] = useState("");
  const [apiUrl, setApiUrl] = useState(""); // State to store the API URL
  const [isFetching, setIsFetching] = useState(false); // State to manage fetch status

  const dispatch = useDispatch();
  const { history } = props;

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

  useEffect(() => {
    if (inputMethod === "import-sample-data") {
      fetchSampleDatabases();
    }
  }, [inputMethod]);

  return (
    <>
      <Header />
      <div id="container" className="container-fluid">
        <div className="row">
          <div className="col-12">
            <h1>
              Problem Identification: Study of input data belonging to different
              domains
            </h1>
            <h2>Objectives of building a Data Science pipeline:</h2>
            <ul>
              <li>
                <strong>Data Integration and Aggregation</strong>
                <ul>
                  <li>
                    <em>Objective:</em> Ensure seamless integration of data from
                    diverse sources.
                  </li>
                  <li>
                    <em>Benefit:</em> Provides a unified view of data, enabling
                    comprehensive analysis and insights.
                  </li>
                </ul>
              </li>
              <li>
                <strong>Data Cleaning and Preprocessing</strong>
                <ul>
                  <li>
                    <em>Objective:</em> Standardize and clean data to ensure
                    consistency and quality.
                  </li>
                  <li>
                    <em>Benefit:</em> Improves the accuracy and reliability of
                    the analysis by removing noise and errors.
                  </li>
                </ul>
              </li>
              <li>
                <strong>Scalability</strong>
                <ul>
                  <li>
                    <em>Objective:</em> Design the pipeline to handle large
                    volumes of data efficiently.
                  </li>
                  <li>
                    <em>Benefit:</em> Ensures the system can grow with
                    increasing data size without degradation in performance.
                  </li>
                </ul>
              </li>
              <li>
                <strong>Flexibility and Modularity</strong>
                <ul>
                  <li>
                    <em>Objective:</em> Create a modular architecture that can
                    easily accommodate new data sources and analysis methods.
                  </li>
                  <li>
                    <em>Benefit:</em> Enhances the adaptability of the pipeline
                    to evolving business needs and technological advancements.
                  </li>
                </ul>
              </li>
              <li>
                <strong>Automation</strong>
                <ul>
                  <li>
                    <em>Objective:</em> Automate repetitive tasks such as data
                    extraction, transformation, and loading (ETL).
                  </li>
                  <li>
                    <em>Benefit:</em> Reduces manual effort, speeds up the data
                    processing cycle, and minimizes human errors.
                  </li>
                </ul>
              </li>
              <li>
                <strong>Reproducibility</strong>
                <ul>
                  <li>
                    <em>Objective:</em> Ensure that the data processing steps
                    are reproducible and can be easily traced and audited.
                  </li>
                  <li>
                    <em>Benefit:</em> Enhances the credibility and reliability
                    of the analytical results.
                  </li>
                </ul>
              </li>
              <li>
                <strong>Real-time Processing</strong>
                <ul>
                  <li>
                    <em>Objective:</em> Incorporate capabilities for real-time
                    data processing and analytics.
                  </li>
                  <li>
                    <em>Benefit:</em> Enables timely insights and
                    decision-making based on the most current data.
                  </li>
                </ul>
              </li>
              <li>
                <strong>Security and Compliance</strong>
                <ul>
                  <li>
                    <em>Objective:</em> Implement robust security measures to
                    protect data privacy and ensure compliance with relevant
                    regulations.
                  </li>
                  <li>
                    <em>Benefit:</em> Safeguards sensitive information and
                    maintains regulatory adherence, thereby building trust with
                    stakeholders.
                  </li>
                </ul>
              </li>
              <li>
                <strong>Visualization and Reporting</strong>
                <ul>
                  <li>
                    <em>Objective:</em> Develop tools and dashboards for
                    effective data visualization and reporting.
                  </li>
                  <li>
                    <em>Benefit:</em> Facilitates better understanding and
                    communication of data insights to stakeholders.
                  </li>
                </ul>
              </li>
              <li>
                <strong>Performance Monitoring and Maintenance</strong>
                <ul>
                  <li>
                    <em>Objective:</em> Set up mechanisms for continuous
                    monitoring and maintenance of the pipeline's performance.
                  </li>
                  <li>
                    <em>Benefit:</em> Ensures the pipeline remains efficient,
                    reliable, and up-to-date with minimal downtime.
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
                <option value="upload-yourself">Take Input Yourself in CSV/JSON file format</option>
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

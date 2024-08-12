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
  const dispatch = useDispatch();
  const { history } = props;

  const processFile = async (text, filename) => {
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

  const onChangeInputFile = async (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      await processFile(text, file.name);
      history.replace("/view"); // Redirect to view module
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
        await processFile(text, filename);

        // Redirect to view module after file processing
        history.replace("/view");
      };
      reader.readAsText(blob);
    } catch (error) {
      console.error("Error fetching database file:", error);
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
                <option value="upload-yourself">Take Input Yourself</option>
                <option value="import-sample-data">Import Sample Data</option>
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
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default withRouter(InputModule);

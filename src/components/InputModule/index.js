import React, { useState, useEffect } from "react";
import Header from "../Header";
import Footer from "../Footer";
import "./index.css";
import { addFile } from "../../store/slices/userSlice";
import { useDispatch } from "react-redux";
import Papa from "papaparse";

const InputModule = (props) => {
  const [inputMethod, setInputMethod] = useState("");
  const [sampleDatabases, setSampleDatabases] = useState([]);
  const dispatch = useDispatch();

  const onChangeInputFile = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      Papa.parse(text, {
        header: true,
        complete: (result) => {
          dispatch(addFile({ name: file.name, content: result.data }));
          localStorage.setItem('file', JSON.stringify({ name: file.name, content: result.data }));
        },
      });
    };
    reader.readAsText(file);
  };

  const fetchSampleDatabases = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/sample-databases');
      const data = await response.json();
      setSampleDatabases(data.sample_databases);
    } catch (error) {
      console.error('Error fetching sample databases:', error);
    }
  };

  const handleDatabaseFileSelection = async (filename) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/sample-databases/${filename}`);
      const data = await response.json();
      dispatch(addFile({ name: filename, content: data }));
      localStorage.setItem('file', JSON.stringify({ name: filename, content: data }));
    } catch (error) {
      console.error('Error fetching database file:', error);
    }
  };

  useEffect(() => {
    if (inputMethod === "import-sample-data") {
      fetchSampleDatabases();
    }
  }, [inputMethod]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const { history } = props;
    history.replace("view");
  };

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
            {/* Objectives list goes here */}
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
                onSubmit={handleSubmit}
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
                <div id="btnContainer">
                  <button type="submit" className="btn btn-primary">
                    Submit
                  </button>
                </div>
              </form>
            )}
            {inputMethod === "import-sample-data" && (
              <div>
                <h3>Import from Database:</h3>
                {sampleDatabases.length > 0 ? (
                  <ul>
                    {sampleDatabases.map((file, index) => (
                      <li key={index}>
                        <button type="button" onClick={() => handleDatabaseFileSelection(file)}>
                          {file}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No sample databases available</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default InputModule;

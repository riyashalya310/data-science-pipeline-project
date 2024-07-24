import { useState } from "react";
import Header from "../Footer";
import Footer from "../Header";
import "./index.css";
import { useDispatch } from "react-redux";
import { addFile } from "../../store/slices/userSlice";

const InputModule = (props) => {
  // State to store the file
  const [inputFile, setInputFile] = useState(null);

  const dispatch=useDispatch();

  // Handler for file input change
  const onChangeInputFile = (event) => {
    setInputFile(event.target.files[0]); // Get the first file from the FileList object
  };

  const addNewFile=(inputFile)=>{
    dispatch(addFile(inputFile));
  }

  // Handler for form submission
  const handleSubmit = (event) => {
    event.preventDefault(); // Prevent the default form submission

    if (inputFile) {
      // Here you can handle the file (e.g., upload it to a server)
      addNewFile(inputFile);
      const {history}=props;
      history.replace('/view')
    } else {
      console.log("No file selected");
    }
  };

  const handleFunc=()=>{}

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
            <h2>Upload CSV File</h2>
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
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default InputModule;

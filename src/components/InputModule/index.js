import { useState } from "react";
import Header from "../Footer";
import Footer from "../Header";
import "./index.css";

const InputModule = (props) => {
  const { onChangeState, history } = props;
  // State to store the file
  const [inputFile, setInputFile] = useState(null);

  // Handler for file input change
  const onChangeInputFile = (event) => {
    setInputFile(event.target.files[0]); // Get the first file from the FileList object
  };

  // Handler for form submission
  // const handleSubmit = (event) => {
  //   event.preventDefault(); // Prevent the default form submission

  //   if (inputFile) {
  //     // Here you can handle the file (e.g., upload it to a server)
  //     onChangeState(inputFile);
  //      history.push("/view");
  //     console.log(inputFile);
  //   } else {
  //     console.log("No file selected");
  //   }
  // };
  const handleSubmit = (event) => {
    event.preventDefault(); // Prevent default form submission
  
    if (inputFile) {
      // Handle the file (e.g., upload it to a server)
      onChangeState(inputFile); // Call parent function with the file
      console.log("File uploaded:", inputFile);
  
      // Redirect to '/view' after successful form submission
      history.push("/view");
    } else {
      console.log("No file selected");
    }
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
            <h2>Objectives of building a Data Science pipeline:</h2>
            <ul>
              {/* (Your existing content) */}
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
                <button  type="submit" className="btn btn-primary">
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



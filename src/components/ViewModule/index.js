import React from "react";
import { useSelector } from "react-redux";
import { FaArrowRight } from "react-icons/fa";
import { IoMdArrowBack } from "react-icons/io";
import "./index.css"; // Import your CSS file here

const ViewModule = (props) => {
  const files = useSelector((state) => state.user.files);
  const file = files.find((f) => f.name === "birthplace-2018-census-csv.csv"); // Replace with your logic

  const moveToAnalysisBtn = () => {
    const { history } = props;
    history.push("/analysis");
  };

  const backBtn = () => {
    const { history } = props;
    history.push("/transform");
  };

  return (
    <div className="file-display">
      {file ? (
        <div>
          <div>
            <button type="button" className="btn btn-primary" onClick={backBtn}>
              <IoMdArrowBack />
              Back
            </button>
            <h2>
              File Content: <span className="file-name">{file.name}</span>
            </h2>
            <button
              type="button"
              className="btn btn-primary"
              onClick={moveToAnalysisBtn}
            >
              Start Analysis
              <FaArrowRight />
            </button>
          </div>
          {Array.isArray(file.content) ? (
            <table className="file-table">
              <thead>
                <tr>
                  {Object.keys(file.content[0]).map((key) => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {file.content.map((row, index) => (
                  <tr key={index}>
                    {Object.values(row).map((value, i) => (
                      <td key={i}>{value}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>The file content is not in the expected format.</p>
          )}
        </div>
      ) : (
        <p>No file selected or file is empty.</p>
      )}
    </div>
  );
};

export default ViewModule;

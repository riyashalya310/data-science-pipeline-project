import { useState, useEffect } from "react";
import Papa from "papaparse";
import { Document, Page } from 'react-pdf';
import Header from "../Footer";
import Footer from "../Header";
import "./index.css";

const ViewModule = () => {
  const [csvData, setCsvData] = useState([]);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [pdfFile, setPdfFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);


  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file.type === 'text/csv') {
      setInputFile(file);
      setPdfFile(null);
    } else if (file.type === 'application/pdf') {
      setPdfFile(file);
      setInputFile(null);
    }
  };

  useEffect(() => {
    if (inputFile) {
      Papa.parse(inputFile, {
        header: true,
        complete: (results) => {
          const csvData = results.data;
          const csvHeaders = Object.keys(csvData[0]);
          setCsvData(csvData);
          setCsvHeaders(csvHeaders);
        },
      });
    }
  }, [inputFile]);


  useEffect(() => {
    if (inputFile) {
      Papa.parse(inputFile, {
        header: true,
        complete: (results) => {
          const csvData = results.data;
          const csvHeaders = Object.keys(csvData[0]);
          setCsvData(csvData);
          setCsvHeaders(csvHeaders);
        },
      });
    }
  }, [inputFile]);


  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };
  

  return (
    <>
      <Header />
      <div id="container" className="container-fluid">
        <div className="row">
          <div className="col-12">
            {inputFile && (
              <div>
                <h1>Uploaded CSV Data</h1>
                <table className="table table-striped table-bordered">
                  <thead>
                    <tr>
                      {csvHeaders.map((header, index) => (
                        <th key={index} className="text-center">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvData.map((row, index) => (
                      <tr key={index}>
                        {csvHeaders.map((header, index) => (
                          <td key={index} className="text-center">{row[header]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {pdfFile && (
              <div>
                <h1>Uploaded PDF</h1>
                <Document
                  file={pdfFile}
                  onLoadSuccess={onDocumentLoadSuccess}
                >
                  <Page pageNumber={pageNumber} />
                </Document>
                <p>Page {pageNumber} of {numPages}</p>
                <button onClick={() => setPageNumber(pageNumber - 1)}>Previous</button>
                <button onClick={() => setPageNumber(pageNumber + 1)}>Next</button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ViewModule;
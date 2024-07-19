// import Header from '../Footer'
// import Footer from '../Header'
import React, { useState, useEffect } from 'react';

const ViewInput = () => {
  const [csvData, setCsvData] = useState([]);
  const [csvHeaders, setCsvHeaders] = useState([]);

  useEffect(() => {
    // Assuming you have a function to parse the CSV file and return the data and headers
    const parseCsv = (csvFile) => {
      const Papa = require('papaparse');
      const csvData = Papa.parse(csvFile, { header: true }).data;
      const csvHeaders = Object.keys(csvData[0]);
      return { csvData, csvHeaders };
    };

    // Get the uploaded CSV file from local storage or API call
    const csvFile = localStorage.getItem('uploadedCsvFile');

    if (csvFile) {
      const { csvData, csvHeaders } = parseCsv(csvFile);
      setCsvData(csvData);
      setCsvHeaders(csvHeaders);
    }
  }, []);

  return (
    <div>
      <h2>Uploaded CSV Data</h2>
      <table>
        <thead>
          <tr>
            {csvHeaders.map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {csvData.map((row, index) => (
            <tr key={index}>
              {csvHeaders.map((header, index) => (
                <td key={index}>{row[header]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ViewInput;

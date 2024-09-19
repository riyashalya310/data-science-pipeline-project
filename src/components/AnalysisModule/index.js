import React, { useRef, useState } from "react";
import { useSelector } from "react-redux";
import { MdOutlineStackedBarChart } from "react-icons/md";
import { FaChartBar, FaChartArea, FaChartPie, FaFilter } from "react-icons/fa";
import { FaTableCells } from "react-icons/fa6";
import { AiOutlineLineChart } from "react-icons/ai";
import { LuScatterChart } from "react-icons/lu";
import { RiDonutChartFill } from "react-icons/ri";
import { IoMdArrowBack } from "react-icons/io";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line, Pie, Scatter } from "react-chartjs-2";
import ChartIcon from "../ChartIcon";
import DropZone from "../DropZone";
import SelectColumnsPopup from "../ColumnSelectionPopup";
import TableColumn from "../TableColumn";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "./index.css";

// Register the required components for Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AnalysisModule = () => {
  const files = useSelector((state) => state.user.files);
  const file = files.find((f) => f.name === "birthplace-2018-census-csv.csv");
  const [charts, setCharts] = useState([]);
  const [aggregateResults, setAggregateResults] = useState([]);
  const [selectedFunction, setSelectedFunction] = useState("");
  const [isTableVisible, setIsTableVisible] = useState(true);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isTableCreationPopupVisible, setIsTableCreationPopupVisible] = useState(false); // New state for popup
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [newTableData, setNewTableData] = useState([]); // New state for table data
  const [mergedTableData, setMergedTableData] = useState(file?.content || []); // State for the merged table

  const aggregateResultsRef = useRef(null);
  const analysisRef = useRef();

  const backBtn = () => {
    window.history.back();
  };

  const handleDrop = (item) => {
    setCharts((prevCharts) => [
      ...prevCharts,
      { ...item, data: null, columnName: "", visible: true },
    ]);
  };

  const toggleChartVisibility = (index) => {
    setCharts((prevCharts) =>
      prevCharts.map((chart, i) =>
        i === index ? { ...chart, visible: !chart.visible } : chart
      )
    );
  };

  const handleDropColumn = (column) => {
    setCharts((prevCharts) =>
      prevCharts.map((chart) =>
        chart.data === null
          ? {
              ...chart,
              data: file.content.map((row) => row[column.columnName]),
              columnName: column.columnName,
            }
          : chart
      )
    );
  };

  const renderChart = (chart, index) => {
    if (!chart.data) return <p>Drop a column here to display the chart</p>;

    const chartData = {
      labels: file.content.map((row, index) => `Row ${index + 1}`),
      datasets: [
        {
          label: chart.columnName,
          data: chart.data,
          backgroundColor:
            chart.type === "pie" || chart.type === "donut"
              ? chart.data.map(() => `hsl(${Math.random() * 360}, 70%, 70%)`)
              : "rgba(75, 192, 192, 0.6)",
        },
      ],
    };

    const chartOptions = {
      maintainAspectRatio: false, // Allow chart resizing
    };

    switch (chart.type) {
      case "bar":
        return <Bar data={chartData} options={chartOptions} />;
      case "line":
        return <Line data={chartData} options={chartOptions} />;
      case "pie":
        return (
          <Pie
            data={chartData}
            options={{
              plugins: {
                legend: {
                  position: "top",
                },
                tooltip: {
                  callbacks: {
                    label: function (tooltipItem) {
                      const value = tooltipItem.raw;
                      return ` ${tooltipItem.label}: ${value}`;
                    },
                  },
                },
              },
            }}
          />
        );
      case "scatter":
        return <Scatter data={chartData} options={chartOptions} />;
      case "area":
        return (
          <Line
            data={chartData}
            options={{ elements: { line: { tension: 0.4 } }, ...chartOptions }}
          />
        );
      case "donut":
        return (
          <Pie
            data={chartData}
            options={{
              plugins: {
                legend: {
                  position: "top",
                },
                tooltip: {
                  callbacks: {
                    label: function (tooltipItem) {
                      const value = tooltipItem.raw;
                      return ` ${tooltipItem.label}: ${value}`;
                    },
                  },
                },
              },
              circumference: Math.PI,
              rotation: -Math.PI,
              ...chartOptions,
            }}
          />
        );
      default:
        return <p>No chart type selected</p>;
    }
  };

  const handlePopupSubmit = (columns) => {
    setSelectedColumns(columns);
    calculateAggregate(selectedFunction, columns); // Pass the selected columns to the aggregation function
  };

  const handlePopupClose = () => {
    setIsPopupVisible(false);
  };

  const calculateAggregate = (func, columns) => {
    if (!file || !file.content || !file.content.length) {
      console.error("File or file content is undefined or empty");
      return;
    }

    if (!Array.isArray(columns) || columns.length === 0) {
      console.error("No columns selected");
      return;
    }

    const results = columns.map((columnName) => {
      const values = file.content
        .map((row) => parseFloat(row[columnName]))
        .filter((v) => !isNaN(v));

      let result;
      switch (func) {
        case "sum":
          result = values.reduce((acc, value) => acc + value, 0);
          break;
        case "count":
          result = values.length;
          break;
        case "average":
          result =
            values.reduce((acc, value) => acc + value, 0) / values.length;
          break;
        case "min":
          result = Math.min(...values);
          break;
        case "max":
          result = Math.max(...values);
          break;
        default:
          result = null;
      }

      return { columnName, result };
    });

    setAggregateResults(results);
    setSelectedFunction(func);

    if (aggregateResultsRef.current) {
      aggregateResultsRef.current.scrollIntoView({ behavior: "smooth" });
    } else {
      console.error("aggregateResultsRef.current is null");
    }
  };

  const handleDropdownChange = (event) => {
    const selectedFunc = event.target.value;
    if (selectedFunc) {
      setSelectedFunction(selectedFunc);
      setIsPopupVisible(true); // Show the popup when an aggregate function is selected
    }
  };

  const downloadPDF = () => {
    const input = analysisRef.current;
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${file ? file.name : "analysis"}.pdf`);
    });
  };

  const toggleTableVisibility = () => {
    setIsTableVisible(!isTableVisible);
  };

  // New Table Creation Handlers
  const handleTableCreation = (rows, columns) => {
    const initialTableData = Array.from({ length: rows }, () =>
      Array(columns).fill("")
    );
    setNewTableData(initialTableData);
    setIsTableCreationPopupVisible(false);
  };

  const handleTableDataChange = (rowIndex, columnIndex, value) => {
    setNewTableData((prevData) => {
      const updatedData = [...prevData];
      updatedData[rowIndex][columnIndex] = value;
      return updatedData;
    });
  };

  const handleTableSubmit = () => {
    // Append new table data to the existing merged table
    const updatedMergedTableData = [...mergedTableData, ...newTableData];
    setMergedTableData(updatedMergedTableData);
    setNewTableData([]); // Clear new table data
  };

  return (
    <>
      <div className="file-display-analysis" ref={analysisRef}>
        {file ? (
          <div>
            <div className="file-analysis-upper-container">
              <button
                type="button"
                className="btn btn-primary"
                onClick={backBtn}
              >
                <IoMdArrowBack />
                Back
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={downloadPDF}
                style={{ marginLeft: "10px", backgroundColor: "#ea70e0" }}
              >
                Download PDF
              </button>
              <h2>
                File Content:{" "}
                <span className="file-name-analysis">{file.name}</span>
              </h2>
            </div>
            <div className="aggregate-functions-container">
              <h1>Aggregate Functions</h1>
              <div>
                <select
                  value={selectedFunction}
                  onChange={handleDropdownChange}
                >
                  <option value="">Select Aggregate Function</option>
                  <option value="average">Display Average</option>
                  <option value="count">Display Count</option>
                  <option value="sum">Display Sum</option>
                  <option value="min">Display Min</option>
                  <option value="max">Display Max</option>
                </select>
              </div>
            </div>
            {Array.isArray(file.content) ? (
              <div className="file-analysis-main-content">
                <div className="row-container">
                  {/* DropZone and Chart Icons */}
                  <div
                    className="dropzone-container"
                    style={{
                      width: isTableVisible ? "75%" : "100%",
                      transition: "width 0.3s ease-in-out",
                    }}
                  >
                    <DropZone
                      onDrop={handleDrop}
                      onDropColumn={handleDropColumn}
                    >
                      {charts.map((chart, index) => (
                        <div
                          key={index}
                          className="chart-container"
                          style={{
                            marginBottom: chart.visible ? "10px" : "0px",
                            padding: chart.visible ? "5px" : "0px",
                            border: chart.visible ? "1px solid #ddd" : "none",
                            background: "#f9f9f9",
                            height: chart.visible
                              ? isTableVisible
                                ? "250px"
                                : "400px"
                              : "auto", // Adjust chart height based on visibility
                          }}
                        >
                          {chart.visible ? (
                            <>
                              <button
                                className="toggle-btn-chart"
                                onClick={() => toggleChartVisibility(index)}
                                style={{
                                  position: "absolute",
                                  top: "10px",
                                  right: "10px",
                                }}
                              >
                                Hide
                              </button>
                              {renderChart(chart, index)}
                            </>
                          ) : (
                            <button
                              className="toggle-btn-chart"
                              onClick={() => toggleChartVisibility(index)}
                              style={{
                                width: "100px",
                                height: "30px",
                                margin: "auto",
                              }}
                            >
                              Show
                            </button>
                          )}
                        </div>
                      ))}
                    </DropZone>
                  </div>

                  <div className="chart-icons-container">
                    <ChartIcon
                      type="bar"
                      icon={<MdOutlineStackedBarChart />}
                      label="Stacked Bar"
                    />
                    <ChartIcon type="bar" icon={<FaChartBar />} label="Bar" />
                    <ChartIcon
                      type="line"
                      icon={<AiOutlineLineChart />}
                      label="Line"
                    />
                    <ChartIcon
                      type="area"
                      icon={<FaChartArea />}
                      label="Area"
                    />
                    <ChartIcon type="pie" icon={<FaChartPie />} label="Pie" />
                    <ChartIcon
                      type="scatter"
                      icon={<LuScatterChart />}
                      label="Scatter"
                    />
                    <ChartIcon
                      type="donut"
                      icon={<RiDonutChartFill />}
                      label="Donut"
                    />
                    <ChartIcon
                      type="filter"
                      icon={<FaFilter />}
                      label="Filter"
                    />
                    <ChartIcon
                      type="table"
                      icon={<FaTableCells />}
                      label="Table"
                      onClick={() => setIsTableCreationPopupVisible(true)} // Open table creation popup
                    />
                  </div>

                  {/* Original Table */}
                  {isTableVisible && (
                    <div className="table-container">
                      <button
                        className="toggle-btn"
                        onClick={toggleTableVisibility}
                      >
                        Hide Table
                      </button>
                      <div className="scrollable-table">
                        <table className="file-table-analysis">
                          <thead>
                            <tr>
                              {Object.keys(file.content[0]).map((key) => (
                                <TableColumn key={key} columnName={key} />
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {mergedTableData.map((row, index) => (
                              <tr key={index}>
                                {Object.values(row).map((value, i) => (
                                  <td key={i}>{value}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {!isTableVisible && (
                    <button
                      className="toggle-btn"
                      onClick={toggleTableVisibility}
                      style={{ height: "80px" }}
                    >
                      Show Table
                    </button>
                  )}
                </div>

                {/* Aggregate Results */}
                {isPopupVisible && (
                  <SelectColumnsPopup
                    columns={Object.keys(file.content[0])} // Pass the column names to the popup
                    onSubmit={handlePopupSubmit}
                    onClose={handlePopupClose}
                  />
                )}


                {/* Aggregate Results */}
                <div className="lower-section" ref={aggregateResultsRef}>
                  <div>
                    {aggregateResults.length > 0 && (
                      <div className="aggregate-results-container">
                        <h2>Aggregate Results:</h2>
                        <table className="aggregate-results-table">
                          <thead>
                            <tr>
                              <th>Column</th>
                              <th>Result</th>
                            </tr>
                          </thead>
                          <tbody>
                            {aggregateResults.map((result, index) => (
                              <tr key={index}>
                                <td>{result.columnName}</td>
                                <td>{result.result}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p>No file selected</p>
            )}
          </div>
        ) : (
          <p>No file selected</p>
        )}
      </div>
    </>
  );
};

export default AnalysisModule;

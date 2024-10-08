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
  registerables,
} from "chart.js";
import { Bar, Line, Pie, Scatter } from "react-chartjs-2";
import ChartIcon from "../ChartIcon";
import DropZone from "../DropZone";
import SelectColumnsPopup from "../ColumnSelectionPopup";
import TableColumn from "../TableColumn";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "./index.css";
import XYColumnSelectionPopup from "../XYColumnSelectionPopup";

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
  const file = files.length > 0 ? files[files.length - 1] : null;
  const [charts, setCharts] = useState([]);
  const [aggregateResults, setAggregateResults] = useState([]);
  const [selectedFunction, setSelectedFunction] = useState("");
  const [isTableVisible, setIsTableVisible] = useState(true);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [columnsToSelect, setColumnsToSelect] = useState([]);
  const [isXYPopupVisible, setIsXYPopupVisible] = useState(false);
  const [chartType, setChartType] = useState("");
  const [mergedTableData, setMergedTableData] = useState(file?.content || []); // State for the merged table

  const aggregateResultsRef = useRef(null);
  const analysisRef = useRef();

  // ----------for debugging to check if dtypes changed --------------------
  const expectedColumnTypes = {
    Index: "number",
    Code: "number", // Replace with the expected data types for your columns
    Birthplace: "string",
    Census_night_population_count: "number",
    Census_usually_resident_population_count: "number",
  };

  const checkColumnTypes = () => {
    if (!file || !file.columnTypes) {
      console.log("File not found or column types not initialized");
      return;
    }

    for (const [column, expectedType] of Object.entries(expectedColumnTypes)) {
      const actualType = file.columnTypes[column];

      if (actualType !== expectedType) {
        console.log(
          `Data type mismatch for column ${column}: expected ${expectedType}, but got ${actualType}`
        );
      } else {
        console.log(
          `Data type for column ${column} is as expected: ${actualType}`
        );
      }
    }
  };

  React.useEffect(() => {
    checkColumnTypes();
  }, [file]);

  // ------------------------------------------------------------------

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

  // Handles dropping of a column
  const handleDropColumn = (column) => {
    if (chartType === "bivariate") {
      setIsXYPopupVisible(true); // Show popup for bivariate charts
    } else {
      setCharts((prevCharts) =>
        prevCharts.map((chart) =>
          chart.data === null
            ? {
                ...chart,
                data: file.content.map((row) => row[column.columnName]), // Set data for univariate
                columnName: column.columnName,
              }
            : chart
        )
      );
    }
  };

  // Handles submission of selected X and Y columns for bivariate charts
  const handleXYPopupSubmit = (columns) => {
    if (chartType === "bivariate" && columns.length === 2) {
      const [xColumn, yColumn] = columns;

      const xData = file.content.map((row) => row[xColumn]);
      const yData = file.content.map((row) => row[yColumn]);

      if (xData.some(isNaN) || yData.some(isNaN)) {
        console.error("One of the columns contains non-numeric data.");
        return;
      }

      const bivariateData = file.content.map((row) => ({
        x: Number(row[xColumn]), // Convert X to number
        y: Number(row[yColumn]), // Convert Y to number
      }));

      setCharts((prevCharts) =>
        prevCharts.map((chart) =>
          chart.data === null
            ? {
                ...chart,
                data: bivariateData, // Pass bivariate data structure
                columnName: `${xColumn} vs ${yColumn}`,
              }
            : chart
        )
      );
    }
    setIsXYPopupVisible(false); // Close the popup
  };

  // Render function to render different types of charts
const renderChart = (chart, index) => {
  if (!chart.data) return <p>Drop a column here to display the chart</p>;

  const indexColumnName = "index"; // Change this to match your index column name

  // Scatter chart logic for bivariate data
  if (chart.type === "scatter") {
      const scatterChartData = {
          datasets: [
              {
                  label: chart.columnName, // This will show `col1 vs col2`
                  data: chart.data, // Pass {x, y} data for scatter plot
                  backgroundColor: "rgba(75, 192, 192, 0.6)",
              },
          ],
      };

      const scatterChartOptions = {
          scales: {
              x: { type: "linear", position: "bottom" },
              y: { beginAtZero: true },
          },
          maintainAspectRatio: false,
          plugins: {
              tooltip: {
                  callbacks: {
                      // Display the x and y values on hover
                      label: (tooltipItem) => {
                          const xValue = tooltipItem.raw.x;
                          const yValue = tooltipItem.raw.y;
                          return `x: ${xValue}, y: ${yValue}`; // Customize to show both x and y values
                      },
                  },
              },
          },
      };

      return <Scatter data={scatterChartData} options={scatterChartOptions} />;
  }

  // For bar/line charts, pie, etc.
  const chartData = {
      labels: file.content.map((row) => row[indexColumnName]), // X labels from index
      datasets: [
          {
              label: chart.columnName, // For bar/line charts
              data: Array.isArray(chart.data) && chart.data[0]?.y !== undefined
                  ? chart.data.map((entry) => entry.y) // For bar/line, extract Y values only
                  : chart.data,
              backgroundColor:
                  chart.type === "pie" || chart.type === "donut"
                      ? chart.data.map(() => `hsl(${Math.random() * 360}, 70%, 70%)`)
                      : "rgba(75, 192, 192, 0.6)",
          },
      ],
  };

  const chartOptions = {
      maintainAspectRatio: false,
      plugins: {
          tooltip: {
              callbacks: {
                  // Custom tooltip callback for univariate charts like bar/line
                  label: (tooltipItem) => {
                      const label = tooltipItem.dataset.label || "";
                      const value = tooltipItem.raw;
                      return `${label}: ${value}`; // Display the label and the corresponding value
                  },
              },
          },
      },
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
                      ...chartOptions,
                      plugins: {
                          legend: { position: "top" },
                          tooltip: {
                              callbacks: {
                                  label: (tooltipItem) =>
                                      `${tooltipItem.label}: ${tooltipItem.raw}`,
                              },
                          },
                      },
                  }}
              />
          );
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
                      ...chartOptions,
                      plugins: {
                          legend: { position: "top" },
                          tooltip: {
                              callbacks: {
                                  label: (tooltipItem) =>
                                      `${tooltipItem.label}: ${tooltipItem.raw}`,
                              },
                          },
                      },
                      circumference: Math.PI,
                      rotation: -Math.PI,
                  }}
              />
          );
      default:
          return <p>No chart type selected</p>;
  }
};


  const getStringColumns = () => {
    if (
      !file ||
      !file.content ||
      file.content.length === 0 ||
      !file.content[0]
    ) {
      console.error("file content is undefined or empty");
      return [];
    }

    return Object.keys(file.content[0]).filter((column) => {
      const dtype = file.columnTypes ? file.columnTypes[column] : null;
      return dtype === "string";
    });
  };

  const getNumericalColumns = () => {
    if (
      !file ||
      !file.content ||
      file.content.length === 0 ||
      !file.content[0]
    ) {
      console.error("file content is undefined or empty");
      return [];
    }

    return Object.keys(file.content[0]).filter((column) => {
      const dtype = file.columnTypes ? file.columnTypes[column] : null;
      return dtype === "number";
    });
  };

  // Modify the popup submission to use only numerical columns
  const handlePopupClose = () => {
    setIsPopupVisible(false);
  };

  const handleChartTypeChange = (event) => {
    setChartType(event.target.value); // Set the selected chart type
    // Reset the charts to allow a fresh selection for each type
    setCharts([]);
  };

  const handlePopupSubmit = (columns) => {
    // Filter the selected columns to include only string columns for aggregation
    const stringColumns = columns.filter((column) => {
      return file.columnTypes[column] === "string";
    });

    // Proceed with the aggregation if there are string columns selected
    if (stringColumns.length > 0) {
      setColumnsToSelect(stringColumns);
      console.log(`handlePopupSubmit: ${stringColumns}`);

      // Perform the aggregation based on the selected function and string columns
      calculateAggregate(selectedFunction, stringColumns);
    } else {
      console.error("No string columns selected for aggregation.");
    }
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

    console.log(`Performing ${func} on columns: `, columns);

    // Create a map to group by the selected categorical column (e.g., Birthplace)
    const groupedData = {};

    file.content.forEach((row) => {
      const key = columns.map((col) => row[col]).join("_"); // Combine the values of the selected columns as key
      if (!groupedData[key]) {
        groupedData[key] = [];
      }
      groupedData[key].push(row); // Add each row to the corresponding group
    });

    // Calculate aggregate function for each group
    const results = Object.keys(groupedData).map((group) => {
      const rows = groupedData[group]; // Rows in the current group
      const numericalColumns = getNumericalColumns(); // Get numerical columns

      // Initialize aggregate results for each numerical column
      const aggregates = {};

      numericalColumns.forEach((numCol) => {
        const values = rows
          .map((row) => row[numCol])
          .filter((v) => typeof v === "number");

        let result;
        switch (func) {
          case "count":
            result = values.length;
            break;
          case "sum":
            result = values.reduce((sum, value) => sum + value, 0);
            break;
          case "min":
            result = Math.min(...values);
            break;
          case "max":
            result = Math.max(...values);
            break;
          case "average":
            result =
              values.reduce((sum, value) => sum + value, 0) / values.length;
            break;
          default:
            console.error("Unsupported function selected");
            result = null;
        }

        aggregates[numCol] = result; // Store the aggregate result for this column
      });

      return { group, aggregates };
    });

    setAggregateResults(results);
    console.log("Aggregate Results:", results);

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
      setIsPopupVisible(true);
    }
  };

  const downloadPDF = () => {
    console.log("download hit");
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
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-evenly",
                }}
              >
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
                <div className="type-of-analysis">
                  <select value={chartType} onChange={handleChartTypeChange}>
                    <option value="">Select Type of Analysis</option>
                    <option value="univariate">Univariate</option>
                    <option value="bivariate">Bivariate</option>
                  </select>
                </div>
              </div>
            </div>
            {Array.isArray(file.content) ? (
              <div className="file-analysis-main-content">
                <div className="row-container">
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
                              : "auto",
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
                  <h1>Types of Charts :-</h1>
                    <div>
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
                    </div>
                    <h1>Other Options :-</h1>
                    <div className="filter-and-table-container">
                      <div className="filter-container">
                        <FaFilter />
                      </div>
                      <div className="filter-container">
                        <FaTableCells />
                      </div>
                    </div>
                  </div>

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

                {/* SelectColumnsPopup for Bivariate Analysis */}
                {isXYPopupVisible && (
                  <XYColumnSelectionPopup
                    onSubmit={handleXYPopupSubmit}
                    onClose={() => setIsXYPopupVisible(false)}
                    availableColumns={getNumericalColumns()}
                  />
                )}

                {isPopupVisible && (
                  <SelectColumnsPopup
                    columns={getStringColumns()}
                    onSubmit={handlePopupSubmit}
                    onClose={handlePopupClose}
                  />
                )}

                <div className="lower-section" ref={aggregateResultsRef}>
                  {aggregateResults.length > 0 && (
                    <div className="aggregate-results-container">
                      <h2>Aggregate Results:</h2>
                      <table className="aggregate-results-table">
                        <thead>
                          <tr>
                            <th>Group</th>
                            <th>Column</th>
                            <th>Result</th>
                          </tr>
                        </thead>
                        <tbody>
                          {aggregateResults.map((result, index) => {
                            const groupKey = result.group; // Get the group from the result
                            const aggregates = result.aggregates; // Access the aggregates object

                            // Ensure aggregates is defined and is an object
                            return aggregates &&
                              typeof aggregates === "object" ? (
                              Object.entries(aggregates).map(
                                (
                                  [aggregateColumn, aggregateValue],
                                  groupIndex
                                ) => (
                                  <tr key={`${index}-${groupIndex}`}>
                                    <td>{groupKey}</td>
                                    <td>{aggregateColumn}</td>
                                    <td>{aggregateValue}</td>
                                  </tr>
                                )
                              )
                            ) : (
                              <tr key={index}>
                                <td colSpan={3}>
                                  No data available for {result.columnName}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
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

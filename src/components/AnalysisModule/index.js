import React, { useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
  MdOutlineStackedBarChart,
  MdHorizontalDistribute,
} from "react-icons/md";
import {
  FaChartBar,
  FaChartArea,
  FaChartPie,
  FaFilter,
  FaArrowRight,
} from "react-icons/fa";
import Joyride from "react-joyride";
import { FaTableCells } from "react-icons/fa6";
import { AiOutlineLineChart } from "react-icons/ai";
import { MdOutlineTour } from "react-icons/md";
import { LuScatterChart } from "react-icons/lu";
import { PiFilePdfLight } from "react-icons/pi";
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
import XYColumnSelectionPopup from "../XYColumnSelectionPopup";
import TableInputPopup from "../TableInputPopup";
import ProbabilityDistributionChart from "../ProbabilityDistributionChart/ProbabilityDistributionChart";

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

const AnalysisModule = (props) => {
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
  const [isTablePopupVisible, setIsTablePopupVisible] = useState(false);
  const [newTable, setNewTable] = useState({ rows: 0, columns: 0, data: [] });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false); //probability distribution
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [probabilityDistribution, setProbabilityDistribution] = useState([]);
  const [isDistributionVisible, setIsDistributionVisible] = useState(false);

  const [isCategorical, setIsCategorical] = useState(false);
  const [selectedColumnsForAggregation, setSelectedColumnsForAggregation] =
    useState([]);

  const aggregateResultsRef = useRef(null);
  const analysisRef = useRef();

  const [tourActive, setTourActive] = useState(false);

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

  const dashboardBtn = () => {
    const { history } = props;
    history.push("/dashboard");
  };

  // Function to toggle the dropdown menu
  const toggleDropdown = () => {
    setIsDistributionVisible(false);
    setIsDropdownOpen(!isDropdownOpen);
  };

  const categoricalColumnsList = file
    ? Object.keys(file.categoricalColumns)
    : [];

  console.log(file);

  // Function to calculate discrete probability distribution for categorical columns
  const calculateDiscreteDistribution = (column) => {
    const originalCategories = file.originalCategories;
    console.log(`original cateogirwes` + originalCategories);
    const values = file.content.map((row) => row[column]);
    const valueCounts = {};

    values.forEach((value) => {
      valueCounts[value] = (valueCounts[value] || 0) + 1;
    });

    const totalValues = values.length;
    const distribution = Object.entries(valueCounts).map(([value, count]) => ({
      value,
      probability: count / totalValues,
    }));

    setProbabilityDistribution(distribution);
    setSelectedColumn(column);
    setIsDistributionVisible(true);
  };

  // Function to calculate continuous probability distribution for numerical columns
  const calculateContinuousDistribution = (column) => {
    const values = file.content
      .map((row) => parseFloat(row[column]))
      .filter((v) => !isNaN(v));
    const min = Math.min(...values);
    const max = Math.max(...values);
    const numBins = 10; // You can make this configurable for flexibility
    const binSize = (max - min) / numBins;

    // Group values into bins
    const bins = Array(numBins).fill(0);
    values.forEach((value) => {
      const binIndex = Math.min(
        Math.floor((value - min) / binSize),
        numBins - 1
      );
      bins[binIndex]++;
    });

    const totalValues = values.length;

    // Create a meaningful distribution object
    const distribution = bins.map((count, index) => {
      const binStart = min + index * binSize;
      const binEnd = binStart + binSize;
      return {
        value: `${binStart.toFixed(2)} - ${binEnd.toFixed(2)}`,
        probability: count / totalValues,
        count, // Add count for additional insights if needed
      };
    });

    setProbabilityDistribution(distribution);
    setSelectedColumn(column);
    setIsDistributionVisible(true);
  };

  // Handle selection of a column
  const handleSelectColumn = (column, isCategorical) => {
    if (isCategorical) {
      calculateDiscreteDistribution(column);
    } else {
      calculateContinuousDistribution(column);
    }
    setIsDropdownOpen(false); // Close dropdown after selection
    setSelectedColumn(column);
    setIsCategorical(isCategorical);
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

  const handleTablePopupSubmit = (rows, columns) => {
    const initialData = Array.from({ length: rows }, () =>
      Array(columns).fill("")
    );
    setNewTable({ rows, columns, data: initialData });
  };

  const handleTableCellChange = (rowIndex, colIndex, value) => {
    const updatedData = [...newTable.data];
    updatedData[rowIndex][colIndex] = value;
    setNewTable({ ...newTable, data: updatedData });
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
          data:
            Array.isArray(chart.data) && chart.data[0]?.y !== undefined
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

  const handleChartTypeChange = (event) => {
    setChartType(event.target.value); // Set the selected chart type
    // Reset the charts to allow a fresh selection for each type
    setCharts([]);
  };

  const handlePopupSubmit = (column) => {
    if (selectedFunction === "count") {
      // For "count", process immediately with selected column(s)
      calculateAggregate(selectedFunction, [column]);
      setIsPopupVisible(false);

      if (aggregateResultsRef.current) {
        aggregateResultsRef.current.scrollIntoView({ behavior: "smooth" });
      }
      return;
    }

    if (isCategorical) {
      // Categorical column selected; switch to numerical selection
      setSelectedColumn(column);
      setIsCategorical(false); // Proceed to numerical column selection
      const numericalColumns = getNumericalColumns();
      setColumnsToSelect(numericalColumns);
    } else {
      // Numerical column selected, finalize aggregation
      const updatedColumns = [...selectedColumnsForAggregation, column];
      setSelectedColumnsForAggregation(updatedColumns);

      // Perform aggregation
      calculateAggregate(selectedFunction, updatedColumns);
      setIsPopupVisible(false);

      if (aggregateResultsRef.current) {
        aggregateResultsRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handlePopupCancel = () => {
    // Skip further column selection and proceed with current selections
    if (selectedColumnsForAggregation.length > 0) {
      calculateAggregate(selectedFunction, selectedColumnsForAggregation);
    }
    setIsPopupVisible(false);
  };

  const calculateAggregate = (func, columns) => {
    if (!file || !file.content || !file.content.length) {
      console.error("File or file content is undefined or empty");
      return;
    }

    if (!columns || columns.length === 0) {
      console.error("No columns selected for aggregation");
      return;
    }

    if (func === "count") {
      const groupedData = {};
      file.content.forEach((row) => {
        const key = columns.map((col) => row[col]).join("_");
        groupedData[key] = (groupedData[key] || 0) + 1;
      });

      const results = Object.entries(groupedData).map(([group, count]) => ({
        group,
        count,
      }));

      setAggregateResults(results);
      return;
    }

    const groupedData = {};
    file.content.forEach((row) => {
      const key = [row[selectedColumn]].join("_");
      groupedData[key] = groupedData[key] || [];
      groupedData[key].push(row);
    });

    const results = Object.entries(groupedData).map(([group, rows]) => {
      const aggregates = {};
      columns.forEach((numCol) => {
        const values = rows.map((row) => row[numCol]).filter((v) => !isNaN(v));
        aggregates[numCol] = calculateAggregateFunction(values, func);
      });
      return { group, aggregates };
    });

    setAggregateResults(results);
  };

  const calculateAggregateFunction = (values, func) => {
    switch (func) {
      case "sum":
        return values.reduce((sum, v) => sum + v, 0);
      case "average":
        return values.length > 0
          ? values.reduce((sum, v) => sum + v, 0) / values.length
          : null;
      case "min":
        return Math.min(...values);
      case "max":
        return Math.max(...values);
      default:
        return null;
    }
  };

  const handleDropdownChange = (event) => {
    const selectedFunc = event.target.value;

    if (selectedFunc) {
      setSelectedFunction(selectedFunc);

      const categoricalColumns = getStringColumns(); // Get categorical columns
      const numericalColumns = getNumericalColumns(); // Get numerical columns

      if (categoricalColumns.length > 0) {
        // If categorical columns exist, proceed with them
        setColumnsToSelect(categoricalColumns);
        setIsCategorical(true);
      } else {
        // If no categorical columns, directly proceed with numerical
        setColumnsToSelect(numericalColumns);
        setIsCategorical(false); // Skip the categorical step
      }

      setIsPopupVisible(true);
      setSelectedColumnsForAggregation([]); // Reset selected columns for aggregation
    }
  };

  const handleCloseTable = () => {
    setNewTable({
      rows: 0,
      columns: 0,
      data: [],
    });
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

  //for informative tour
  const steps = [
    {
      target: ".file-analysis-upper-container",
      disableBeacon: true,
      content:
        "Awesome!!! You have reached till here. So, this is the header of the Analysis module.",
    },
    {
      target: "#back-button",
      disableBeacon: true,
      content:
        "This is the button through which you can go back to the View Module module.",
    },
    {
      target: "#download-btn",
      disableBeacon: true,
      content:
        "This is the button through which you can download the pdf of the analysis part.",
    },
    {
      target: ".file-name-analysis",
      disableBeacon: true,
      content: "Here you can see the name of the uploaded file.",
    },
    {
      target: ".scrollable-table",
      disableBeacon: true,
      content: "This is the file you have just applied ETL transformations.",
    },
    {
      target: ".analysis-options-container",
      disableBeacon: true,
      content:
        "This container contains two different operations you can apply on the content.",
    },
    {
      target: "#aggregate-function",
      disableBeacon: true,
      content: "From here you can apply different aggregations.",
    },
    {
      target: "#analysis-type",
      disableBeacon: true,
      content:
        "From this dropdown, you can apply different type of plots variations for multiple categories of columns.",
    },
    {
      target: "#chart-icons-container",
      disableBeacon: true,
      content:
        "From here you can choose different type of charts depending on the type of variation you chose from dropdown.",
    },
    {
      target: ".dropzone-container",
      disableBeacon: true,
      content:
        "Whooo!! Here, you can drag and drop the charts and on top of that you can drop the the column to show their respective charts.",
    },
    {
      target: ".filter-and-table-container",
      disableBeacon: true,
      content: "Here are some other options you can try out for your data.",
    },
    {
      target: "#dashboard-btn",
      disableBeacon: true,
      content: "Through this button, you can go to the dashboard module.",
    },
  ];

  const startTour = () => {
    setTourActive(true);
  };

  steps.forEach((step) => {
    if (!document.querySelector(step.target)) {
      console.warn(`Target not found: ${step.target}`);
    }
  });

  return (
    <>
      {/* <Header/> */}
      <Joyride
        steps={steps}
        continuous
        showProgress
        showSkipButton
        run={tourActive}
        disableBeacon
        disableOverlayClose={false}
        callback={(data) => {
          if (data.status === "finished" || data.status === "skipped") {
            setTourActive(false);
          }
        }}
        styles={{
          options: {
            zIndex: 10000,
          },
        }}
      />

      <div className="file-display-analysis" ref={analysisRef}>
        {file ? (
          <div>
            <div className="file-analysis-upper-container">
              <button
                type="button"
                className="btn btn-primary"
                onClick={backBtn}
                id="back-button"
              >
                <IoMdArrowBack />
                Back
              </button>
              <button
                id="download-btn"
                type="button"
                className="btn btn-secondary"
                onClick={downloadPDF}
                style={{
                  marginLeft: "10px",
                  backgroundColor: "#ea70e0",
                  height: "50px",
                }}
              >
                <PiFilePdfLight size={30} />
                {"    "}Download
              </button>
              <h2>
                File Content:{" "}
                <span className="file-name-analysis">{file.name}</span>
              </h2>
              <button
                className="start-tour-btn"
                style={{
                  margin: "10px",
                  height: "max-content",
                  textAlign: "center",
                  padding: "10px",
                  backgroundColor: "rgb(143 89 170)",
                }}
                onClick={startTour}
              >
                Start Tour{"     "}
                <MdOutlineTour />
              </button>
              <button
                type="button"
                className="btn"
                style={{ backgroundColor: "rgb(207 74 100)" }}
                onClick={dashboardBtn}
                id="dashboard-btn"
              >
                Dashboard <FaArrowRight />
              </button>
            </div>
            <div className="analysis-options-container">
              <div className="aggregate-functions-panel">
                <h2 style={{ margin: "10px", textAlign: "center" }}>
                  Analysis Options :
                </h2>
                <div className="analysis-dropdowns">
                  <div
                    className="dropdown-group"
                    style={{ alignItems: "center" }}
                  >
                    <label htmlFor="aggregate-function">
                      Aggregate Functions:
                    </label>
                    <select
                      id="aggregate-function"
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

                  <div
                    className="dropdown-group"
                    style={{ alignItems: "center" }}
                  >
                    <label htmlFor="analysis-type">Type of Analysis:</label>
                    <select
                      id="analysis-type"
                      value={chartType}
                      onChange={handleChartTypeChange}
                    >
                      <option value="">Select Type of Analysis</option>
                      <option value="univariate">Univariate</option>
                      <option value="bivariate">Bivariate</option>
                      <option value="categorical">Categorical</option>
                    </select>
                  </div>
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
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <h1
                      style={{
                        width: "40%",
                        textAlign: "center",
                        fontSize: "25px",
                        alignSelf: "center",
                        marginTop: "10px",
                      }}
                    >
                      DropZone
                    </h1>
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
                    <div id="chart-icons-container">
                      {chartType !== "categorical" ? (
                        <>
                          <ChartIcon
                            type="line"
                            icon={<AiOutlineLineChart />}
                            label="Line"
                          />
                          <ChartIcon
                            type="bar"
                            icon={<MdOutlineStackedBarChart />}
                            label="Stacked Bar"
                          />
                          {/* r-bar chart */}
                          {chartType === "bivariate" ? (
                            <ChartIcon
                              type="scatter"
                              icon={<LuScatterChart />}
                              label="Scatter"
                            />
                          ) : (
                            <></>
                          )}
                          <ChartIcon
                            type="donut"
                            icon={<RiDonutChartFill />}
                            label="Donut"
                          />
                          {chartType === "univariate" ? (
                            <>
                              <ChartIcon
                                type="area"
                                icon={<FaChartArea />}
                                label="Area"
                              />
                              <ChartIcon
                                type="bar"
                                icon={<FaChartBar />}
                                label="Bar"
                              />
                            </>
                          ) : (
                            <></>
                          )}
                        </>
                      ) : (
                        <ChartIcon
                          type="pie"
                          icon={<FaChartPie />}
                          label="Pie"
                        />
                      )}
                    </div>
                    <h1>Other Options :-</h1>
                    <div className="filter-and-table-container">
                      <div className="filter-container">
                        <FaFilter />
                      </div>
                      <div
                        className="filter-container"
                        onClick={() => setIsTablePopupVisible(true)}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-evenly",
                        }}
                      >
                        <FaTableCells />
                        Editable Table
                      </div>
                      <div
                        className="filter-container"
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-evenly",
                        }}
                        onClick={toggleDropdown}
                      >
                        <MdHorizontalDistribute size={25} />
                        Probability Distribution
                      </div>
                    </div>
                  </div>

                  {isTableVisible && (
                    <div
                      className="table-container"
                      style={{ marginLeft: "20px" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "space-around",
                        }}
                      >
                        <h1 style={{ fontSize: "25px" }}>Table</h1>
                        <button
                          className="toggle-btn"
                          onClick={toggleTableVisibility}
                          style={{ height: "50px", padding: "10px" }}
                        >
                          Hide Table
                        </button>
                      </div>
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
                    columns={
                      isCategorical ? getStringColumns() : getNumericalColumns()
                    } // Conditionally pass columns based on the current step
                    onSubmit={handlePopupSubmit}
                    onClose={handlePopupCancel} // Optionally handle canceling in different steps
                    isCategoricalStep={isCategorical} // Optional: track the step in the popup if needed for logic
                    title={
                      isCategorical
                        ? "Select Categorical Column"
                        : "Select Numerical Column"
                    } // Dynamic title based on step
                  />
                )}

                {isTablePopupVisible && (
                  <TableInputPopup
                    onClose={() => setIsTablePopupVisible(false)}
                    onSubmit={handleTablePopupSubmit}
                  />
                )}

                {newTable.rows > 0 && newTable.columns > 0 && (
                  <div
                    className="new-table-container"
                    style={{
                      marginTop: "20px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: "#f9f9f9",
                      padding: "20px",
                      borderRadius: "8px",
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                      position: "relative", // Relative for table positioning
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        maxWidth: "600px",
                      }}
                    >
                      <button
                        onClick={handleCloseTable}
                        style={{
                          position: "absolute",
                          top: "-10px",
                          right: "-10px",
                          background: "transparent",
                          border: "none",
                          fontSize: "18px",
                          cursor: "pointer",
                          color: "#888",
                          borderRadius: "50%",
                          width: "30px",
                          height: "30px",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor: "#f0f0f0", // Background for better visibility
                        }}
                      >
                        &times;
                      </button>
                      <h3
                        style={{
                          marginBottom: "15px",
                          color: "#333",
                          textAlign: "center",
                          textDecoration: "underline",
                        }}
                      >
                        New Editable Table
                      </h3>
                      <table
                        style={{
                          borderCollapse: "collapse",
                          width: "100%",
                          maxWidth: "600px",
                        }}
                      >
                        <thead>
                          <tr>
                            {Array.from({ length: newTable.columns }).map(
                              (_, index) => (
                                <TableColumn
                                  key={index}
                                  style={{
                                    border: "1px solid #ddd",
                                    padding: "10px",
                                    textAlign: "center",
                                    backgroundColor: "#f0f0f0",
                                    fontWeight: "bold",
                                  }}
                                  columnName={`Column ${index + 1}`}
                                />
                              )
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {newTable.data.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              {row.map((cell, colIndex) => (
                                <td
                                  key={colIndex}
                                  style={{
                                    border: "1px solid #ddd",
                                    padding: "8px",
                                    textAlign: "center",
                                  }}
                                >
                                  <input
                                    type="text"
                                    value={cell}
                                    onChange={(e) =>
                                      handleTableCellChange(
                                        rowIndex,
                                        colIndex,
                                        e.target.value
                                      )
                                    }
                                    style={{
                                      width: "100%",
                                      padding: "5px",
                                      border: "1px solid #ccc",
                                      borderRadius: "4px",
                                      textAlign: "center",
                                    }}
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {isDropdownOpen && (
                  <div className="dropdown">
                    <h4>Categorical Columns</h4>
                    <ul>
                      {categoricalColumnsList.length > 0 ? (
                        categoricalColumnsList.map((column) => (
                          <li
                            key={column}
                            className="cursor-pointer"
                            onClick={() => handleSelectColumn(column, true)}
                          >
                            {column}
                          </li>
                        ))
                      ) : (
                        <li>No categorical columns available.</li>
                      )}
                    </ul>
                    <h4>Numerical Columns</h4>
                    {console.log(Object.keys(file.columnTypes))}
                    <ul>
                      {Object.keys(file.columnTypes).map((column) =>
                        file.columnTypes[column] === "number" ? (
                          <li
                            key={column}
                            className="cursor-pointer"
                            onClick={() => handleSelectColumn(column, false)}
                          >
                            {column}
                          </li>
                        ) : null
                      )}
                    </ul>
                  </div>
                )}

                {/* Display probability distribution */}
                {isDistributionVisible && (
                  <div className="analysis-probability-display">
                    <h2>Probability Distribution for {selectedColumn}</h2>
                    <div className="analysis-scrollable-table">
                      <table className="analysis-probability-distribution-table">
                        <thead>
                          <tr>
                            <th>Value</th>
                            <th>Probability</th>
                          </tr>
                        </thead>
                        <tbody>
                          {probabilityDistribution.map((item, index) => (
                            <tr key={index}>
                              <td>
                                {isCategorical && file.originalCategories
                                  ? file.originalCategories[selectedColumn]?.[
                                      item.value
                                    ] || item.value
                                  : item.value}
                              </td>
                              <td>{(item.probability * 100).toFixed(2)}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="analysis-distribution-chart-container">
                      <ProbabilityDistributionChart
                        data={probabilityDistribution}
                        containerHeight="300px"
                        containerWidth="100%"
                        isCategorical={isCategorical} // Pass the isCategorical flag
                        originalCategories={
                          isCategorical && file.originalCategories
                            ? file.originalCategories[selectedColumn]
                            : null
                        } // Pass original categories if available
                      />
                    </div>
                  </div>
                )}

                <div className="lower-section" ref={aggregateResultsRef}>
                  {aggregateResults.length > 0 && (
                    <div className="aggregate-results-container">
                      <h2>Aggregate Results:</h2>
                      <table className="aggregate-results-table">
                        <thead>
                          <tr>
                            <th>Category</th>
                            {selectedFunction === "count" ? (
                              <th>Count</th>
                            ) : (
                              <>
                                <th>Column</th>
                                <th>Result</th>
                              </>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {aggregateResults.map((result, index) => {
                            // Always display the original category
                            const originalCategory =
                              isCategorical &&
                              file.originalCategories &&
                              file.originalCategories[selectedColumn]
                                ? file.originalCategories[selectedColumn][
                                    result.group
                                  ] || result.group // Fallback to encoded category if original is not found
                                : result.group; // For cases where isCategorical is false, just use the group

                            // Display count results (if the selected function is 'count')
                            if (selectedFunction === "count") {
                              return (
                                <tr key={index}>
                                  <td>{originalCategory}</td>
                                  <td>{result.count}</td>
                                </tr>
                              );
                            }

                            const aggregates = result.aggregates;

                            // Display results for other aggregate functions
                            return aggregates &&
                              typeof aggregates === "object" ? (
                              Object.entries(aggregates).map(
                                (
                                  [aggregateColumn, aggregateValue],
                                  groupIndex
                                ) => (
                                  <tr key={`${index}-${groupIndex}`}>
                                    <td>{originalCategory}</td>
                                    <td>{aggregateColumn}</td>
                                    <td>
                                      {aggregateValue !== null
                                        ? aggregateValue
                                        : "N/A"}
                                    </td>
                                  </tr>
                                )
                              )
                            ) : (
                              <tr key={index}>
                                <td colSpan={3}>
                                  No data available for {result.group}
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
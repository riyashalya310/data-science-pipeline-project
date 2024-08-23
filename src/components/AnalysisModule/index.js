import React, { useRef, useState } from "react";
import { useSelector } from "react-redux";
import { MdOutlineStackedBarChart } from "react-icons/md";
import { FaChartBar, FaChartArea, FaChartPie, FaFilter } from "react-icons/fa";
import { FaTableCells } from "react-icons/fa6";
import { AiOutlineLineChart } from "react-icons/ai";
import { LuScatterChart } from "react-icons/lu";
import { RiDonutChartFill } from "react-icons/ri";
import { TbChartTreemap } from "react-icons/tb";
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
import TableColumn from "../TableColumn";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import "./index.css";

// Register the required components
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

  const aggregateResultsRef=useRef(null);
  const analysisRef = useRef();  

  const backBtn = () => {
    window.history.back();
  };

  const handleDrop = (item) => {
    setCharts((prevCharts) => [
      ...prevCharts,
      { ...item, data: null, columnName: "" },
    ]);
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

  const renderChart = (chart) => {
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

    switch (chart.type) {
      case "bar":
        return <Bar data={chartData} />;
      case "line":
        return <Line data={chartData} />;
      case "pie":
        return (
          <Pie
            data={chartData}
            options={{
              plugins: {
                legend: {
                  position: 'top',
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
        return <Scatter data={chartData} />;
      case "area":
        return <Line data={chartData} options={{ elements: { line: { tension: 0.4 } } }} />;
      case "donut":
        return (
          <Pie
            data={chartData}
            options={{
              plugins: {
                legend: {
                  position: 'top',
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
            }}
          />
        );
      case "treemap":
        return <p>Treemap chart is not supported with Chart.js. Consider using another library for treemaps.</p>;
      default:
        return <p>No chart type selected</p>;
    }
  };

  const calculateAggregate = (func) => {
    if (!file || !file.content || !file.content.length) return;

    const numericalColumns = Object.keys(file.content[0]).filter((key) =>
      !isNaN(parseFloat(file.content[0][key]))
    );

    const results = numericalColumns.map((columnName) => {
      const values = file.content.map((row) =>
        parseFloat(row[columnName])
      );

      let result;
      switch (func) {
        case "sum":
          result = values.reduce((acc, value) => acc + value, 0);
          break;
        case "count":
          result = values.length;
          break;
        case "average":
          result = values.reduce((acc, value) => acc + value, 0) / values.length;
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
    aggregateResultsRef.current.scrollIntoView({ behavior: "smooth" });
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
                style={{ marginLeft: '10px' }}
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
                <button
                  type="button"
                  onClick={() => calculateAggregate("average")}
                >
                  Display Average
                </button>
                <button type="button" onClick={() => calculateAggregate("count")}>
                  Display Count
                </button>
                <button type="button" onClick={() => calculateAggregate("sum")}>
                  Display Sum
                </button>
                <button type="button" onClick={() => calculateAggregate("min")}>
                  Display Min
                </button>
                <button type="button" onClick={() => calculateAggregate("max")}>
                  Display Max
                </button>
              </div>
            </div>
            {Array.isArray(file.content) ? (
              <div className="file-analysis-main-content">
                <div className="upper-section">
                  <div className="dropzone-container">
                    <DropZone
                      onDrop={handleDrop}
                      onDropColumn={handleDropColumn}
                    >
                      {charts.map((chart, index) => (
                        <div
                          key={index}
                          style={{
                            padding: "10px",
                            border: "1px solid #ddd",
                            marginBottom: "10px",
                            background: "#f9f9f9",
                          }}
                        >
                          {renderChart(chart)}
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
                    <ChartIcon
                      type="scatter"
                      icon={<LuScatterChart />}
                      label="Scatter"
                    />
                    <ChartIcon type="pie" icon={<FaChartPie />} label="Pie" />
                    <ChartIcon
                      type="donut"
                      icon={<RiDonutChartFill />}
                      label="Donut"
                    />
                    <ChartIcon
                      type="treemap"
                      icon={<TbChartTreemap />}
                      label="Treemap"
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
                    />
                  </div>
                </div>
                <div className="table-container">
                  <table className="file-table-analysis">
                    <thead>
                      <tr>
                        {Object.keys(file.content[0]).map((key) => (
                          <TableColumn key={key} columnName={key} />
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
                </div>
                <div className="aggregate-results-container" ref={aggregateResultsRef}>
                  <h2>Aggregate Results: {selectedFunction}</h2>
                  <table className="aggregate-results-table">
                    <thead>
                      <tr>
                        <th>Column Name</th>
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
              </div>
            ) : (
              <p>The file content is not in the expected format.</p>
            )}
          </div>
        ) : (
          <p>No file selected or file is empty.</p>
        )}
      </div>
    </>
  );
};

export default AnalysisModule;

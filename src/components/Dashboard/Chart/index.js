import React, { useState } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import { CiSquareRemove } from "react-icons/ci";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css"; // Import CSS for resizable box
import "./index.css";

const Chart = ({ file, onRemove }) => {
  const [chartType, setChartType] = useState("bar");
  const [xColumn, setXColumn] = useState("");
  const [yColumn, setYColumn] = useState("");
  const [showChart, setShowChart] = useState(false);

  const columns = Object.keys(file.content[0] || {});

  const getData = () => {
    const labels = file.content.map((row) => row[xColumn]);
    const data = file.content.map((row) => row[yColumn]);
    return {
      labels,
      datasets: [
        {
          label: yColumn,
          data,
          backgroundColor: "rgba(75,192,192,0.4)",
        },
      ],
    };
  };

  const handleShowChart = () => {
    if (chartType && xColumn && yColumn) {
      setShowChart(true);
    }
  };

  return (
    <div className="chart">
      <button
        className="remove-button"
        style={{ padding: "0", backgroundColor: "none" }}
        onClick={onRemove}
      >
        <CiSquareRemove />
      </button>
      <h4>Chart</h4>
      {!showChart ? (
        <div className="chart-inputs">
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
          >
            <option value="bar">Bar</option>
            <option value="line">Line</option>
            <option value="pie">Pie</option>
          </select>
          <select
            value={xColumn}
            onChange={(e) => setXColumn(e.target.value)}
          >
            <option value="">Select X-Axis</option>
            {columns.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
          <select
            value={yColumn}
            onChange={(e) => setYColumn(e.target.value)}
          >
            <option value="">Select Y-Axis</option>
            {columns.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
          <button
            className="show-chart-button"
            onClick={handleShowChart}
            disabled={!chartType || !xColumn || !yColumn}
          >
            Show Chart
          </button>
        </div>
      ) : (
        <ResizableBox
          className="resizable-chart-box"
          width={500}
          height={400}
          minConstraints={[200, 200]} // Allow resizing to smaller sizes
          maxConstraints={[1000, 800]} // Allow resizing to larger sizes
          axis="both"
        >
          {chartType === "bar" && <Bar data={getData()} />}
          {chartType === "line" && <Line data={getData()} />}
          {chartType === "pie" && <Pie data={getData()} />}
        </ResizableBox>
      )}
    </div>
  );
};

export default Chart;

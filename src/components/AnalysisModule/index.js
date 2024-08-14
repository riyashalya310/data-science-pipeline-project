import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { MdOutlineStackedBarChart } from 'react-icons/md';
import { FaChartBar, FaChartArea, FaChartPie, FaFilter } from 'react-icons/fa';
import { FaTableCells } from 'react-icons/fa6';
import { AiOutlineLineChart } from 'react-icons/ai';
import { LuScatterChart } from 'react-icons/lu';
import { RiDonutChartFill } from 'react-icons/ri';
import { TbChartTreemap } from 'react-icons/tb';
import { IoMdArrowBack } from 'react-icons/io';
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
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import ChartIcon from '../ChartIcon';
import DropZone from '../DropZone';
import TableColumn from '../TableColumn';
import './index.css';

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

  const backBtn = () => {
    window.history.back();
  };

  const handleDrop = (item) => {
    setCharts((prevCharts) => [...prevCharts, { ...item, data: null, columnName: '' }]);
  };

  const handleDropColumn = (column) => {
    setCharts((prevCharts) =>
      prevCharts.map((chart) =>
        chart.data === null
          ? { ...chart, data: file.content.map((row) => row[column.columnName]), columnName: column.columnName }
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
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        },
      ],
    };

    switch (chart.type) {
      case 'bar':
        return <Bar data={chartData} />;
      case 'line':
        return <Line data={chartData} />;
      case 'pie':
        return <Pie data={chartData} />;
      default:
        return <p>No chart type selected</p>;
    }
  };

  return (
    <>
      <div className="file-display-analysis">
        {file ? (
          <div>
            <div className="file-analysis-upper-container">
              <button type="button" className="btn btn-primary" onClick={backBtn}>
                <IoMdArrowBack />
                Back
              </button>
              <h2>
                File Content: <span className="file-name-analysis">{file.name}</span>
              </h2>
            </div>
            {Array.isArray(file.content) ? (
              <div className="file-analysis-main-content">
                <div className="upper-section">
                  <div className="dropzone-container">
                    <DropZone onDrop={handleDrop} onDropColumn={handleDropColumn}>
                      {charts.map((chart, index) => (
                        <div
                          key={index}
                          style={{
                            padding: '10px',
                            border: '1px solid #ddd',
                            marginBottom: '10px',
                            background: '#f9f9f9',
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
                    <ChartIcon
                      type="bar"
                      icon={<FaChartBar />}
                      label="Bar"
                    />
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
                    <ChartIcon
                      type="pie"
                      icon={<FaChartPie />}
                      label="Pie"
                    />
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

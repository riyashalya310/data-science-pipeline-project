import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { MdOutlineStackedBarChart } from 'react-icons/md';
import { FaChartBar, FaChartArea, FaChartPie, FaFilter } from 'react-icons/fa';
import { FaTableCells } from 'react-icons/fa6';
import { AiOutlineLineChart } from 'react-icons/ai';
import { LuScatterChart } from 'react-icons/lu';
import { RiDonutChartFill } from 'react-icons/ri';
import { TbChartTreemap } from 'react-icons/tb';
import ChartIcon from '../ChartIcon';
import DropZone from '../DropZone';
import TableColumn from '../TableColumn';
import './index.css';
import SampleDataNavbar from '../SampleDataNavbar';

const AnalysisModule = () => {
  const files = useSelector((state) => state.users);
  const file = files[files.length - 1];
  const [charts, setCharts] = useState([]);
  const [columnData, setColumnData] = useState({});


  const handleDrop = (item) => {
    setCharts((prevCharts) => [...prevCharts, { ...item, data: null }]);
  };

  const handleDropColumn = (chartType, columnName) => {
    setCharts((prevCharts) =>
      prevCharts.map((chart) =>
        chart.type === chartType && chart.data === null
          ? { ...chart, data: file.content.map((row) => row[columnName]) }
          : chart
      )
    );
  };

  const renderChart = (chart) => {
    // Assuming a simple rendering logic; replace with actual chart component.
    if (!chart.data) return <p>Drop a column here to display chart</p>;
    switch (chart.type) {
      case 'bar':
        return (
          <div>
            <h2>{chart.label}</h2>
            {/* Example placeholder for Bar Chart */}
            <div style={{ height: '150px', background: '#eee' }}>
              Bar Chart Placeholder
            </div>
          </div>
        );
      case 'line':
        return (
          <div>
            <h2>{chart.label}</h2>
            {/* Example placeholder for Line Chart */}
            <div style={{ height: '150px', background: '#eee' }}>
              Line Chart Placeholder
            </div>
          </div>
        );
      // Add cases for other chart types
      default:
        return <p>No chart type selected</p>;
    }
  };

  return (
    <>
    <SampleDataNavbar/>
    <div className="file-display-analysis">
      {file ? (
        <div>
          <div className="file-analysis-upper-container">
            <h2>
              File Content: <span className="file-name-analysis">{file.name}</span>
            </h2>
            <div></div>
          </div>
          {Array.isArray(file.content) ? (
            <div className="file-analysis-main-content">
              <div className="upper-section">
                <div className="dropzone-container">
                  <DropZone onDrop={handleDrop}>
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
                    onDropColumn={handleDropColumn}
                    style={{height: "20px",textAlign: "center"}}
                  />
                  <ChartIcon
                    type="bar"
                    icon={<FaChartBar />}
                    label="Bar"
                    onDropColumn={handleDropColumn}
                  />
                  <ChartIcon
                    type="line"
                    icon={<AiOutlineLineChart />}
                    label="Line"
                    onDropColumn={handleDropColumn}
                  />
                  <ChartIcon
                    type="area"
                    icon={<FaChartArea />}
                    label="Area"
                    onDropColumn={handleDropColumn}
                  />
                  <ChartIcon
                    type="scatter"
                    icon={<LuScatterChart />}
                    label="Scatter"
                    onDropColumn={handleDropColumn}
                  />
                  <ChartIcon
                    type="pie"
                    icon={<FaChartPie />}
                    label="Pie"
                    onDropColumn={handleDropColumn}
                  />
                  <ChartIcon
                    type="donut"
                    icon={<RiDonutChartFill />}
                    label="Donut"
                    onDropColumn={handleDropColumn}
                  />
                  <ChartIcon
                    type="treemap"
                    icon={<TbChartTreemap />}
                    label="Treemap"
                    onDropColumn={handleDropColumn}
                  />
                  <ChartIcon
                    type="filter"
                    icon={<FaFilter />}
                    label="Filter"
                    onDropColumn={handleDropColumn}
                  />
                  <ChartIcon
                    type="table"
                    icon={<FaTableCells />}
                    label="Table"
                    onDropColumn={handleDropColumn}
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
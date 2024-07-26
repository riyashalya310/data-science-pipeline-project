import React, { useState } from "react";
import { useSelector } from "react-redux";
import { IoMdArrowBack } from "react-icons/io";
import { MdOutlineStackedBarChart } from "react-icons/md";
import { FaChartBar, FaChartArea, FaChartPie, FaFilter } from "react-icons/fa";
import { FaTableCells } from "react-icons/fa6";
import { AiOutlineLineChart } from "react-icons/ai";
import { LuScatterChart } from "react-icons/lu";
import { RiDonutChartFill } from "react-icons/ri";
import { TbChartTreemap } from "react-icons/tb";
import ChartIcon from "../ChartIcon";
import DropZone from "../DropZone";
import "./index.css";

const AnalysisModule = () => {
  const files = useSelector((state) => state.users);
  const file = files[files.length - 1];
  const [charts, setCharts] = useState([]);

  const backBtn = () => {
    window.history.back();
  };

  const handleDrop = (item) => {
    setCharts((prevCharts) => [...prevCharts, item]);
  };

  return (
    <div className="file-display-analysis">
      {file ? (
        <div>
          <div className="file-analysis-upper-container">
            <button type="button" className="btn btn-primary" onClick={backBtn}>
              <IoMdArrowBack />
              Back
            </button>
            <h2>
              File Content:{" "}
              <span className="file-name-analysis">{file.name}</span>
            </h2>
            <div></div>
          </div>
          {Array.isArray(file.content) ? (
            <div>
              <div style={{width: "100%"}}>
                <DropZone onDrop={handleDrop}>
                  {charts.map((chart, index) => (
                    <div
                      key={index}
                      style={{
                        padding: "10px",
                        border: "1px solid #ddd",
                        marginBottom: "10px",
                        width: "100%"
                      }}
                    >
                      <div>{chart.icon}</div>
                      <div>{chart.label}</div>
                    </div>
                  ))}
                </DropZone>
                <table className="file-table-analysis">
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
              </div>
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
                <ChartIcon type="area" icon={<FaChartArea />} label="Area" />
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
                <ChartIcon type="filter" icon={<FaFilter />} label="Filter" />
                <ChartIcon type="table" icon={<FaTableCells />} label="Table" />
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
  );
};

export default AnalysisModule;

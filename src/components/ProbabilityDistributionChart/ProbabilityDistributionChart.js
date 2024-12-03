import React, { useEffect, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import * as d3 from "d3";
import "./index.css";

// Register necessary components
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
);

const generateExampleDistribution = (type) => {
  switch (type) {
    case "normal":
      return {
        label: "Normal",
        data: [2, 4, 6, 8, 6, 4, 2],
        color: "rgba(75, 192, 192, 1)",
      };
    case "leftSkew":
      return {
        label: "Left Skewed",
        data: [8, 6, 4, 3, 2, 1, 0.5],
        color: "rgba(255, 99, 132, 1)",
      };
    case "rightSkew":
      return {
        label: "Right Skewed",
        data: [0.5, 1, 2, 3, 4, 6, 8],
        color: "rgba(54, 162, 235, 1)",
      };
    case "mesokurtic":
      return {
        label: "Mesokurtic",
        data: [2, 4, 8, 10, 8, 4, 2],
        color: "rgba(153, 102, 255, 1)",
      };
    case "leptokurtic":
      return {
        label: "Leptokurtic",
        data: [1, 2, 5, 15, 5, 2, 1],
        color: "rgba(255, 159, 64, 1)",
      };
    case "platykurtic":
      return {
        label: "Platykurtic",
        data: [3, 3, 3, 3, 3, 3, 3],
        color: "rgba(75, 192, 192, 1)",
      };
    default:
      return { label: "", data: [], color: "" };
  }
};

const ProbabilityDistributionChart = ({
  data,
  containerHeight,
  containerWidth,
  isCategorical,
  originalCategories,
}) => {
  const [skewness, setSkewness] = useState(0);
  const [kurtosis, setKurtosis] = useState(0);
  const [skewnessExplain,toggleSkewnessExplain]=useState(false)
  const [kurtosisExplain,togglekurtosisExplain]=useState(false)

  useEffect(() => {
    if (!isCategorical) {
      const values = data.map((item) => parseFloat(item.value));
      const probabilities = data.map((item) => item.probability);

      const mean = d3.mean(values);
      const variance = d3.variance(values);

      const skew =
        d3.mean(
          values.map((v) => (v - mean) ** 3 * probabilities[values.indexOf(v)])
        ) / Math.pow(variance, 1.5);
      setSkewness(skew);

      const kurt =
        d3.mean(
          values.map((v) => (v - mean) ** 4 * probabilities[values.indexOf(v)])
        ) /
        variance ** 2;
      setKurtosis(kurt);
    }
  }, [data, isCategorical]);

  const labels = isCategorical
    ? data.map((item) => originalCategories[item.value] || item.value)
    : data.map((item) => item.value);

  console.log(labels);
  console.log(data);

  const chartData = {
    labels: labels, // Use pre-processed labels for proper display
    datasets: [
      {
        label: "Probability Distribution",
        data: data.map((item) => item.probability),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Probability Distribution" },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: "Probability" } },
      x: { title: { display: true, text: "Categories" } },
    },
  };

  const skewnessData = {
    labels: Array(7).fill(""),
    datasets: ["normal", "leftSkew", "rightSkew"].map((type) => {
      const distribution = generateExampleDistribution(type);
      return {
        label: distribution.label,
        data: distribution.data,
        borderColor: distribution.color,
        backgroundColor: distribution.color,
        fill: false,
      };
    }),
  };

  const kurtosisData = {
    labels: Array(7).fill(""),
    datasets: ["mesokurtic", "leptokurtic", "platykurtic"].map((type) => {
      const distribution = generateExampleDistribution(type);
      return {
        label: distribution.label,
        data: distribution.data,
        borderColor: distribution.color,
        backgroundColor: distribution.color,
        fill: false,
      };
    }),
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: "top" },
      title: { display: true },
    },
    scales: {
      x: { title: { display: true, text: "Distribution" } },
      y: { beginAtZero: true },
    },
  };

  const interpretSkewness = () => {
    if (Math.abs(skewness) < 0.1) return "This distribution is symmetric.";
    if (skewness > 0)
      return "This distribution is right-skewed, meaning it has a longer right tail.";
    return "This distribution is left-skewed, meaning it has a longer left tail.";
  };

  const interpretKurtosis = () => {
    if (kurtosis < 3)
      return "This distribution is platykurtic, indicating lighter tails than a normal distribution.";
    if (kurtosis === 3)
      return "This distribution is mesokurtic, with a tail weight similar to a normal distribution.";
    return "This distribution is leptokurtic, with heavier tails than a normal distribution.";
  };

  const isNormalDistribution = () => {
    return Math.abs(skewness) < 0.1 && Math.abs(kurtosis - 3) < 0.5;
  };


  const handleDropdownChange = (event) => {
    const topic = event.target.value;

    if (topic==='skew') {
      toggleSkewnessExplain(true)
      togglekurtosisExplain(false)
      } else if (topic==='kurt'){
        togglekurtosisExplain(true)
        toggleSkewnessExplain(false)
      }
      else{
        togglekurtosisExplain(false)
        toggleSkewnessExplain(false)
      }
    }

  return (
    <div
      style={{
        height: containerHeight,
        width: containerWidth,
        marginBottom: "1200px",
      }}
    >
      <label style={{fontStyle: "italic"}}>Theoretical Understanding :
      <select onChange={handleDropdownChange} style={{width: "50%",marginLeft: "50px"}}>
        <option value="">Show Explanation</option>
        <option value="skew">Understand Skewness</option>
        <option value="kurt">Understand Kurtosis</option>
      </select>
      </label>
      <div style={{ display: "flex", flexDirection: "row" }}>
        {skewnessExplain?<div style={{ width: "50%" }}>
            <h3>Understanding Skewness</h3>
            <Line
              data={skewnessData}
              options={{
                ...lineOptions,
                plugins: {
                  ...lineOptions.plugins,
                  title: { text: "Skewness Examples" },
                },
              }}
            />
        </div>:null}
        {kurtosisExplain?<div style={{ width: "50%" }}>
            <h3>Understanding Kurtosis</h3>
            <Line
              data={kurtosisData}
              options={{
                ...lineOptions,
                plugins: {
                  ...lineOptions.plugins,
                  title: { text: "Kurtosis Examples" },
                },
              }}
            />
        </div>:null}
      </div>
      <h3>Probability Distribution for Selected Column</h3>
      <Bar data={chartData} options={options} />

      <div className="distribution-analysis">
        <h4 style={{ fontStyle: "italic" }}>Analysis</h4>
        <p>
          <strong>Skewness:</strong> {skewness.toFixed(2)}
        </p>
        <p>{interpretSkewness()}</p>
        <p>
          <strong>Kurtosis:</strong> {kurtosis.toFixed(2)}
        </p>
        <p>{interpretKurtosis()}</p>

        <h4 style={{ fontStyle: "italic" }}>Interpretation:</h4>
        <p>
          <strong>
            {isNormalDistribution()
              ? "This distribution is normal."
              : "This distribution is not normal."}
          </strong>
        </p>

        <h4>Formulas</h4>
        <p>
          <strong>Skewness Formula:</strong>
          <br />
          <em>
            Skewness = &sum; (Xᵢ - μ)³ / (n * σ³)
            <br />
            Where:
            <br />
            Xᵢ = Each data point, μ = Mean, σ = Standard deviation, n = Number
            of data points
          </em>
        </p>
        <p>
          <strong>Kurtosis Formula:</strong>
          <br />
          <em>
            Kurtosis = &sum; (Xᵢ - μ)⁴ / (n * σ⁴)
            <br />
            Where:
            <br />
            Xᵢ = Each data point, μ = Mean, σ = Standard deviation, n = Number
            of data points
          </em>
        </p>

        <div
          className="distribution-guidance"
          style={{ marginBottom: "500px" }}
        >
          <h4>Normalization Suggestions</h4>
          <ul>
            <li>
              <strong>For Right-Skewed Distributions:</strong> Apply a log or
              square root transformation to reduce skewness.
            </li>
            <li>
              <strong>For Left-Skewed Distributions:</strong> Apply a power
              transformation (e.g., squaring).
            </li>
            <li>
              <strong>For High Kurtosis:</strong> Consider Winsorizing data to
              limit extreme values or use a Box-Cox transformation.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProbabilityDistributionChart;

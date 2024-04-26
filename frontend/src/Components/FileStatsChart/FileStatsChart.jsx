import { useEffect, useState, useRef } from "react";
import { Line } from "@ant-design/plots";
import axios from "axios";
import { Select } from "antd";
import "./FileStatsChart.css";

const { Option } = Select;

const FileStatsChart = ({ companyName }) => {
  const [data, setData] = useState([]);
  const [range, setRange] = useState("7");
  const [chartWidth, setChartWidth] = useState(null);
  const chartContainerRef = useRef(null);

  useEffect(() => {
    fetchData(companyName, range);
  }, [companyName, range]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length > 0) setChartWidth(entries[0].contentRect.width);
    });
    if (chartContainerRef.current)
      resizeObserver.observe(chartContainerRef.current);
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const fetchData = async (companyName, range) => {
    try {
      const params = companyName !== "all" ? { companyName, range } : { range };
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/chart/stats`,
        {
          params,
          withCredentials: true,
        }
      );
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleRangeChange = (value) => {
    setRange(value);
  };

  const config = {
    data,
    xField: "_id",
    yField: "filesAdded",
    seriesField: "companyName",
    yAxis: {
      label: {
        formatter: (value) => `${value}`,
      },
    },
    xAxis: {
      label: {
        autoRotate: false,
      },
    },
    height: 350,
    width: chartWidth,
  };

  return (
    <div className="chart-container" ref={chartContainerRef}>
      <div className="chart-title">
        <h2>Files Added Over Time</h2>
        <div className="select-container">
          <Select
            defaultValue="7"
            style={{ width: 120 }}
            onChange={handleRangeChange}
          >
            <Option value="7">Last 7 Days</Option>
            <Option value="14">Last 14 Days</Option>
            <Option value="21">Last 21 Days</Option>
          </Select>
        </div>
      </div>
      <Line {...config} />
    </div>
  );
};

export default FileStatsChart;

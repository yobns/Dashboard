import { Table } from "antd";
import "./ChartDisplay.css";

const ChartDisplay = ({ jsonData }) => {
  const chartData = jsonData.map((item, index) => ({
    key: index + 1,
    label: `Data ${index + 1}`,
    ...Object.keys(item).reduce((acc, key) => {
      if (key !== "label") {
        acc[key] = item[key];
      }
      return acc;
    }, {}),
  }));

  const columns = Object.keys(chartData[0] || {}).map((key) => ({
    title: key,
    dataIndex: key,
    key,
  }));

  return (
    <div>
      <Table dataSource={chartData} columns={columns} />
    </div>
  );
};

export default ChartDisplay;

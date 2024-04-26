import { useState, useEffect } from "react";
import { Modal, Table } from "antd";

const ChartDisplay = ({ jsonData, fileName }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    if (jsonData) setIsModalVisible(true);
  }, [jsonData]);

  let adjustedData = [];
  if (Array.isArray(jsonData)) {
    adjustedData = jsonData.slice(1).map((item) => ({
      key: Object.values(item).join("-"),
      ...Object.keys(item).reduce((acc, key) => {
        if (key !== "label") acc[key] = item[key];
        return acc;
      }, {}),
    }));
  }

  const columns = Object.keys(adjustedData[0] || {})
    .filter((key) => key !== "key")
    .map((key) => ({
      title: key,
      dataIndex: key,
      key,
    }));

  return (
    <Modal
      title={fileName}
      open={isModalVisible}
      onCancel={() => setIsModalVisible(false)}
      width={1000}
      footer={null}
    >
      {Array.isArray(jsonData) ? (
        <Table dataSource={adjustedData} columns={columns} />
      ) : (
        <p>No data available</p>
      )}
    </Modal>
  );
};

export default ChartDisplay;

import { useState, useEffect } from "react";
import { Select, Spin, Alert } from "antd";
import axios from "axios";
import ChartDisplay from "../../Components/ChartDisplay/ChartDisplay";
import "./Data.css";
import { useParams } from "react-router-dom";

const { Option } = Select;

const Data = () => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { fileName } = useParams();

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/file/getFiles`,
          { withCredentials: true }
        );
        setFiles(response.data);
        if (fileName) {
          setSelectedFile(fileName);
          const fileToDisplay = response.data.find(
            (file) => file.fileName === fileName
          );
          if (fileToDisplay) await handleChange(fileName);
        }
      } catch (error) {
        setError("Error fetching files. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [fileName]);

  const handleChange = async (value) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/file/${value}`,
        { withCredentials: true }
      );
      setFileData(response.data);
    } catch (error) {
      setError("Error fetching file data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="data-container">
      <div className="dropdown">
        <Select
          value={selectedFile}
          showSearch
          style={{ width: 200 }}
          placeholder="Select a file"
          optionFilterProp="children"
          onChange={handleChange}
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          disabled={loading}
        >
          {files.map((file) => (
            <Option key={file._id} value={file.fileName}>
              {file.fileName}
            </Option>
          ))}
        </Select>
      </div>
      {loading && (
        <div className="loading-container">
          <Spin size="large" />
        </div>
      )}
      {error && <Alert message={error} type="error" showIcon />}
      {fileData && <ChartDisplay jsonData={fileData} />}
    </div>
  );
};

export default Data;

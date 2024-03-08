import { useState } from "react";
import axios from "axios";
import { Upload, Button, Input, message } from "antd";
import { CloudUploadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const FileUpload = () => {
  const [fileList, setFileList] = useState([]);
  const [customFileName, setCustomFileName] = useState("");
  const navigate = useNavigate();

  const beforeUpload = (file) => {
    const isCSVOrXLSX = /\.(csv|xlsx)$/.test(file.name);
    if (!isCSVOrXLSX) {
      message.error("You can only upload CSV/XLSX file !");
      return Upload.LIST_IGNORE;
    }
    return false;
  }

  const handleFileChange = ({ fileList: newFileList }) => {
    const latestFileList = newFileList.slice(-1);
    setFileList(latestFileList);
    if (latestFileList.length > 0) {
      const file = latestFileList[0];
      const fileNameWithoutExtension = file.name.replace(/\.(csv|xlsx)$/, "");
      setCustomFileName(fileNameWithoutExtension);
    } else {
      setCustomFileName("");
    }
  }

  const uploadFile = async () => {
    const formData = new FormData();
    const file = fileList[0].originFileObj;
    formData.append("file", file);
    formData.append("customName", customFileName || file.name);
  
    try {
      const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/file/upload`, formData, { withCredentials: true });
      message.success('File uploaded successfully');
      navigate(`/data/${response.data.fileName}`);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message)
        message.error(error.response.data.message);
      else
        message.error("Upload failed due to an unexpected error.");
    }
  }

  return (
    <div>
      <Upload.Dragger
        name="file"
        fileList={fileList}
        beforeUpload={beforeUpload}
        onChange={handleFileChange}
        onRemove={() => setFileList([])}
        multiple={false}
        showUploadList={true}
      >
        <p className="ant-upload-drag-icon">
          <CloudUploadOutlined />
        </p>
        <p className="ant-upload-text">Drop or Click to upload your spreadsheet.</p>
        <p className="ant-upload-hint">Only CSV/XLSX files are allowed</p>
      </Upload.Dragger>
      {fileList.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <Input
            addonBefore="Custom File Name:"
            value={customFileName}
            onChange={(e) => setCustomFileName(e.target.value)}
            placeholder="Enter custom file name here"
          />
          <Button
            type="primary"
            style={{ marginTop: 20 }}
            onClick={uploadFile}
            disabled={!customFileName}
          >
            Upload
          </Button>
        </div>
      )}
    </div>
  );
}

export default FileUpload;
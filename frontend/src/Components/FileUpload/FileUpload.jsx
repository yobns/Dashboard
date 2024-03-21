import { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, Button, Input, message, Form, Select } from 'antd';
import { CloudUploadOutlined, BankOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const FileUpload = () => {
  const [fileList, setFileList] = useState([]);
  const [customFileName, setCustomFileName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [existingCompanies, setExistingCompanies] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [showCompanyInput, setShowCompanyInput] = useState(false);
  const navigate = useNavigate();

  const beforeUpload = (file) => {
    const isCSVOrXLSX = /\.(csv|xlsx)$/.test(file.name);
    if (!isCSVOrXLSX) {
      message.error('You can only upload CSV/XLSX files!');
      return Upload.LIST_IGNORE;
    }
    return false;
  };

  const handleFileChange = ({ fileList: newFileList }) => {
    setShowCompanyInput(false);
    setCompanyName('');
    setHeaders([]);
    const latestFileList = newFileList.slice(-1);
    setFileList(latestFileList);
    if (latestFileList.length > 0) {
      const file = latestFileList[0].originFileObj;
      const fileNameWithoutExtension = file.name.replace(/\.(csv|xlsx)$/, '');
      setCustomFileName(fileNameWithoutExtension);
      checkFileHeaders(file);
    } else {
      setCustomFileName('');
    }
  };

  const checkFileHeaders = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/structure/verifyHeaders`, formData, {
        withCredentials: true,
      });
      if (response.data.requestCompanyName) {
        setShowCompanyInput(true);
        setHeaders(response.data.headers);
        setExistingCompanies(response.data.existingCompanies || []);
      } else {
        setShowCompanyInput(false);
        setCompanyName(response.data.companyName);
      }
    } catch (error) {
      console.error('Error verifying file headers:', error);
      message.error('Failed to verify file headers.');
    }
  };

  const handleUpload = async () => {
    if (showCompanyInput && companyName) {
      try {
        if (existingCompanies.includes(companyName)) {
          await axios.post(`${import.meta.env.VITE_SERVER_URL}/structure/update`, { companyName, newHeaders: headers }, { withCredentials: true });
        } else {
          await axios.post(`${import.meta.env.VITE_SERVER_URL}/structure/add`, { companyName, headers: headers }, { withCredentials: true });
        }
        message.success('Structure added/updated successfully');
      } catch (error) {
        message.error('Failed to add/update structure');
      }
    }
    uploadFile();
  };

  const uploadFile = async () => {
    const formData = new FormData();
    const file = fileList[0].originFileObj;
    formData.append('file', file);
    formData.append('customName', customFileName || file.name);
    formData.append('companyName', companyName);
    try {
      const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/file/upload`, formData, {
        withCredentials: true,
      });
      if (response.status === 202 && response.data.requestCompanyName) {
        setHeaders(response.data.headers);
        setShowCompanyInput(true);
      } else {
        message.success('File uploaded successfully');
        navigate(`/data/${response.data.fileName}`);
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message)
        message.error(error.response.data.message);
      else
        message.error('Upload failed due to an unexpected error.');
    }
  };

  return (
    <div>
      <Upload.Dragger name="file" fileList={fileList} beforeUpload={beforeUpload} onChange={handleFileChange} onRemove={() => setFileList([])}
        multiple={false} showUploadList={true}>
        <p className="ant-upload-drag-icon">
          <CloudUploadOutlined />
        </p>
        <p className="ant-upload-text">Drop or Click to upload your spreadsheet.</p>
        <p className="ant-upload-hint">Only CSV/XLSX files</p>
      </Upload.Dragger>
      {fileList.length > 0 && (
        <Form layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item label="File name:">
            <Input
              value={customFileName}
              onChange={(e) => setCustomFileName(e.target.value)}
              placeholder="Enter custom file name here"
              className="rounded-input"
            />
          </Form.Item>
          {showCompanyInput && (
            <>
              <Form.Item label={<span style={{ color: '#FAAC14' }}><BankOutlined /> Company not recognized !</span>}>
                <Select
                  mode="tags"
                  style={{ width: '100%' }}
                  placeholder="Enter or select the company name for this Structure"
                  notFoundContent={null}
                  value={companyName ? [companyName] : []}
                  onChange={(values) => { setCompanyName(values[0]); }}
                  onBlur={() => { if (!companyName) setCompanyName("") }}
                >
                  {existingCompanies.map(company => (
                    <Select.Option key={company} value={company}>{company}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </>
          )}
          <Form.Item>
            <Button type="primary" onClick={handleUpload} disabled={!customFileName || (showCompanyInput && !companyName)}>
              Upload
            </Button>
          </Form.Item>
        </Form>
      )}
    </div>
  );
};

export default FileUpload;
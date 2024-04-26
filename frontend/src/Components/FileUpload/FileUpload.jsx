import { useState, useEffect } from "react";
import axios from "axios";
import {
  Upload,
  Button,
  Input,
  message,
  Form,
  Select,
  Checkbox,
  Table,
} from "antd";
import { CloudUploadOutlined, BankOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

const FileUpload = () => {
  const [fileList, setFileList] = useState([]);
  const [fileData, setFileData] = useState([]);
  const [customFileName, setCustomFileName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [existingCompanies, setExistingCompanies] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [selectedHeaders, setSelectedHeaders] = useState([]);
  const [showCompanyInput, setShowCompanyInput] = useState(false);
  const [allHeaders, setAllHeaders] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [originalFileData, setOriginalFileData] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [headersSelected, setHeadersSelected] = useState(false);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);
  const navigate = useNavigate();
  const MAX_FILE_SIZE = 1024 * 1024;

  useEffect(() => {
    if (fileList.length === 0) return;

    const file = fileList[0].originFileObj;
    const fileNameWithoutExtension = file.name.replace(/\.(csv|xlsx)$/, "");
    setCustomFileName(fileNameWithoutExtension);

    readExcelFile(file);
  }, [fileList]);

  useEffect(() => {
    const sortedData = [...fileData].sort((a, b) => sorter(a, b, sortColumn));
    setFileData(sortOrder === "ascend" ? sortedData : sortedData.reverse());
  }, [sortColumn, sortOrder]);

  const readExcelFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const bufferArray = e.target.result;
      const workbook = XLSX.read(bufferArray, { type: "buffer" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      setFileData(jsonData);
      setOriginalFileData(jsonData);
    };
    reader.readAsArrayBuffer(file);
  };

  const beforeUpload = (file) => {
    const isCSVOrXLSX = /\.(csv|xlsx)$/.test(file.name);
    if (!isCSVOrXLSX) {
      message.error("You can only upload CSV/XLSX files!");
      return Upload.LIST_IGNORE;
    }
    if (file.size > MAX_FILE_SIZE) {
      message.error(
        "File size exceeds the limit (1MB). Please upload a smaller file."
      );
      return Upload.LIST_IGNORE;
    }
    return false;
  };

  const checkFileHeaders = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/structure/verifyHeaders`,
        formData,
        {
          withCredentials: true,
        }
      );
      handleResponse(response);
    } catch (error) {
      console.error("Error verifying file headers:", error);
      message.error("Failed to verify file headers.");
    }
  };

  const handleResponse = (response) => {
    if (response.data.requestCompanyName) {
      setShowCompanyInput(true);
      setHeaders(response.data.headers);
      setAllHeaders(
        response.data.headers.map((header) => ({
          title: header,
          dataIndex: header,
          key: header,
        }))
      );
      setExistingCompanies(response.data.existingCompanies || []);
    } else {
      setShowCompanyInput(false);
      setCompanyName(response.data.companyName);
    }
  };

  const handleFileChange = ({ fileList: newFileList }) => {
    setShowCompanyInput(false);
    setCompanyName("");
    setHeaders([]);
    setSelectedHeaders([]);
    setAllHeaders([]);
    const latestFileList = newFileList.slice(-1);
    setFileList(latestFileList);
    if (latestFileList.length > 0) {
      const file = latestFileList[0].originFileObj;
      checkFileHeaders(file);
    } else {
      setCustomFileName("");
      setOriginalFileData([]);
    }
  };

  const handleUpload = async () => {
    if (isUploading) {
      message.warning("Upload is already in progress. Please wait.");
      return;
    }
    setIsUploading(true);

    if (showCompanyInput && companyName) {
      try {
        await uploadCompany(companyName, selectedHeaders, existingCompanies);
        message.success("Company added/updated successfully");
      } catch (error) {
        message.error("Failed to add/update company");
      }
    }
    try {
      await uploadFile();
    } catch (error) {
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const uploadCompany = async (companyName, headers, existingCompanies) => {
    const url = existingCompanies.includes(companyName)
      ? `${import.meta.env.VITE_SERVER_URL}/structure/update`
      : `${import.meta.env.VITE_SERVER_URL}/structure/add`;
    const data = existingCompanies.includes(companyName)
      ? { companyName, newHeaders: headers }
      : { companyName, headers: headers };
    await axios.post(url, data, { withCredentials: true });
  };

  const uploadFile = async () => {
    const formData = new FormData();
    const file = fileList[0].originFileObj;
    formData.append("file", file);
    formData.append("customName", customFileName || file.name);
    formData.append("companyName", companyName);
    formData.append("selectedHeaders", JSON.stringify(selectedHeaders));
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/file/upload`,
        formData,
        {
          withCredentials: true,
        }
      );
      if (response.status === 202 && response.data.requestCompanyName) {
        setHeaders(response.data.headers);
        setShowCompanyInput(true);
      } else {
        message.success("File uploaded successfully");
        navigate(`/files`);
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message)
        message.error(error.response.data.message);
      else message.error("Upload failed due to an unexpected error.");
    }
  };

  const handleHeaderSelection = (header, checked) => {
    const updatedHeaders = checked
      ? [...allHeaders, { title: header, dataIndex: header, key: header }]
      : allHeaders.filter((h) => h.title !== header);

    setSelectedHeaders(
      checked
        ? [...selectedHeaders, header]
        : selectedHeaders.filter((h) => h !== header)
    );
    setAllHeaders(updatedHeaders);
    setHeadersSelected(selectedHeaders.length > 0);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedHeaders([...headers]);
      setAllHeaders(
        headers.map((header) => ({
          title: header,
          dataIndex: header,
          key: header,
        }))
      );
    } else {
      setSelectedHeaders([]);
      setAllHeaders([]);
    }
  };

  const handleSearch = () => {
    const filteredData = originalFileData.filter((row) => {
      for (const header of selectedHeaders) {
        if (
          row[header] &&
          row[header]
            .toString()
            .toLowerCase()
            .includes(searchValue.toLowerCase())
        ) {
          return true;
        }
      }
      return false;
    });
    setFileData(filteredData);
  };

  const handleReset = () => {
    setSearchValue("");
    setFileData(originalFileData);
    setHeadersSelected(false);
    setSelectedHeaders([]);
    setAllHeaders([]);
  };

  const sorter = (a, b, dataIndex) => {
    const valueA = a[dataIndex];
    const valueB = b[dataIndex];

    if (valueA == null || valueB == null) {
      return valueA === valueB ? 0 : valueA ? 1 : -1;
    }

    if (!isNaN(valueA) && !isNaN(valueB)) {
      return parseFloat(valueA) - parseFloat(valueB);
    }

    return valueA.toString().localeCompare(valueB.toString());
  };

  const handleChange = (pagination, filters, sorter) => {
    setSortColumn(sorter.columnKey);
    setSortOrder(sorter.order);
  };

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
        <p className="ant-upload-text">
          Drop or Click to upload your spreadsheet.
        </p>
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
              <Form.Item
                label={
                  <span style={{ color: "#FAAC14" }}>
                    <BankOutlined /> Company not recognized !
                  </span>
                }
              >
                <Select
                  mode="tags"
                  style={{ width: "100%" }}
                  placeholder="Create or select a company."
                  notFoundContent={null}
                  value={companyName ? [companyName] : []}
                  onChange={(values) => {
                    setCompanyName(values[0]);
                  }}
                  onBlur={() => {
                    if (!companyName) setCompanyName("");
                  }}
                >
                  {existingCompanies.map((company) => (
                    <Select.Option key={company} value={company}>
                      {company}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </>
          )}
          {headers.length > 0 && (
            <Form.Item label="Select Headers:">
              <Checkbox
                checked={selectedHeaders.length === headers.length}
                onChange={handleSelectAll}
              >
                Select All
              </Checkbox>
              {headers.map((header) => (
                <Checkbox
                  key={header}
                  onChange={(e) =>
                    handleHeaderSelection(header, e.target.checked)
                  }
                  checked={selectedHeaders.includes(header)}
                >
                  {header}
                </Checkbox>
              ))}
            </Form.Item>
          )}
          <Form.Item>
            <Button
              type="primary"
              onClick={handleUpload}
              disabled={
                !customFileName ||
                (showCompanyInput && !companyName) ||
                selectedHeaders.length === 0
              }
            >
              Upload
            </Button>
          </Form.Item>
        </Form>
      )}
      {allHeaders.length > 0 && (
        <>
          <Form layout="inline" onFinish={handleSearch}>
            <Form.Item name="title">
              <Input
                placeholder="Search by title"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                disabled={!headersSelected}
              >
                Search
              </Button>
            </Form.Item>
            <Form.Item>
              <Button onClick={handleReset}>Reset</Button>
            </Form.Item>
          </Form>
          {!headersSelected && (
            <p style={{ color: "red", margin: 10 }}>
              Please select headers before searching
            </p>
          )}
          <Table
            columns={allHeaders.map((header) => ({
              ...header,
              sorter: (a, b) => sorter(a, b, header.dataIndex),
              sortOrder: sortColumn === header.dataIndex ? sortOrder : false,
            }))}
            dataSource={fileData.map((row, index) => ({ ...row, key: index }))}
            pagination={{ pageSize: 10 }}
            rowKey="key"
            loading={isUploading}
            onChange={handleChange}
            scroll={{ x: "max-content" }}
            size="small"
            style={{ marginTop: 16 }}
            footer={() => (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <b>Total Rows:</b> {fileData.length}
                </div>
              </div>
            )}
            components={{
              body: {
                row: (props) => <tr {...props} onClick={props.onRow} />,
              },
            }}
          />
        </>
      )}
    </div>
  );
};

export default FileUpload;

import { useEffect, useState, useCallback, useMemo } from "react";
import { Button, Modal, Select, Spin, Table, DatePicker, Input } from "antd";
import axios from "axios";
import "./Files.css";
import {
  PieChartOutlined,
  DownloadOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import ChartDisplay from "../../Components/ChartDisplay/ChartDisplay";
import moment from "moment";
import { useParams } from "react-router-dom";

const { Option } = Select;

const Files = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState("all");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedChartData, setSelectedChartData] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [companies, setCompanies] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedHeaders, setEditedHeaders] = useState("");
  const [editingFileName, setEditingFileName] = useState("");

  const { fileName } = useParams();

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/file/getFiles`,
        { withCredentials: true }
      );
      const sortedFiles = response.data.sort(
        (a, b) => moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf()
      );
      setFiles(sortedFiles);
      const uniqueCompanyNames = [
        ...new Set(response.data.map((file) => file.companyName)),
      ];
      setCompanies(uniqueCompanyNames);
    } catch (error) {
      console.error("Error fetching files", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const viewChart = useCallback(async (fileName) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/file/${fileName}`,
        { withCredentials: true }
      );
      setSelectedChartData(response.data.jsonData);
      setSelectedFileName(response.data.fileName);
    } catch (error) {
      console.error("Error fetching chart data", error);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
    if (fileName) {
      viewChart(fileName);
    }
  }, [fileName, fetchFiles, viewChart]);

  const handleDateChange = useCallback((date) => {
    setSelectedDate(date);
  }, []);

  const disabledDates = useCallback(
    (current) => {
      const filteredByCompanyFiles = files.filter(
        (file) =>
          selectedCompany === "all" || file.companyName === selectedCompany
      );
      const fileDates = filteredByCompanyFiles.map((file) =>
        moment(file.createdAt).format("YYYY-MM-DD")
      );
      const uniqueDates = new Set(fileDates);
      return !uniqueDates.has(current.format("YYYY-MM-DD"));
    },
    [files, selectedCompany]
  );

  const exportToFile = useCallback(async (fileName) => {
    window.open(
      `${import.meta.env.VITE_SERVER_URL}/file/export/${fileName}`,
      "_blank"
    );
  }, []);

  const deleteFile = useCallback(
    async (fileName) => {
      try {
        await axios.delete(
          `${import.meta.env.VITE_SERVER_URL}/file/delete/${fileName}`,
          { withCredentials: true }
        );
        fetchFiles();
      } catch (error) {
        console.log(error);
      }
    },
    [fetchFiles]
  );

  const showDeleteConfirm = useCallback(
    (fileName) => {
      Modal.confirm({
        title: (
          <div>
            <span style={{ color: "#faad14" }}>Delete File | </span>
            <span>{fileName}</span>
          </div>
        ),
        icon: <DeleteOutlined />,
        content: (
          <div>
            <p>Are you sure?</p>
            <p style={{ color: "grey" }}>This action cannot be undone.</p>
          </div>
        ),
        okText: "Yes",
        okType: "danger",
        cancelText: "No",
        centered: true,
        onOk() {
          deleteFile(fileName);
        },
      });
    },
    [deleteFile]
  );

  const showEditModal = useCallback((fileName, jsonData) => {
    setEditingFileName(fileName);
    const headerString = Object.keys(jsonData[0]).join(', ');
    setEditedHeaders(headerString);
    setEditModalVisible(true);
  }, []);

  const editHeaders = useCallback(async () => {
    try {
      const headersArray = editedHeaders.split(',').map(header => header.trim());
      const headersObject = headersArray.reduce((acc, header) => {
        acc[header] = header;
        return acc;
      }, {});
      await axios.put(`${import.meta.env.VITE_SERVER_URL}/file/edit/headers/${editingFileName}`, {
        headers: headersObject
      }, { withCredentials: true });
      setEditModalVisible(false);
      fetchFiles();
    } catch (error) {
      console.error("Error editing headers", error);
    }
  }, [editingFileName, editedHeaders, fetchFiles]);

  const columns = useMemo(
    () => [
      { title: "Name", dataIndex: "fileName", key: "fileName" },
      { title: "Company", dataIndex: "companyName", key: "companyName" },
      {
        title: "Date",
        dataIndex: "createdAt",
        key: "createdAt",
        render: (text) => <span>{text ? moment(text).format("LLL") : ""}</span>,
      },
      {
        key: "action",
        align: "center",
        render: (_, record) => (
          <>
            <Button
              type="link"
              title="View Data"
              onClick={() => viewChart(record.fileName)}
            >
              <PieChartOutlined />
            </Button>
            <Button
              type="link"
              title="Download File"
              onClick={() => exportToFile(record.fileName)}
            >
              <DownloadOutlined />
            </Button>
            <Button
              type="link"
              title="Edit Headers"
              onClick={() =>
                showEditModal(record.fileName, record.jsonData)
              }
            >
              <EditOutlined />
            </Button>
            <Button
              type="link"
              title="Delete File"
              onClick={() => showDeleteConfirm(record.fileName)}
            >
              <DeleteOutlined />
            </Button>
          </>
        ),
      },
    ],
    [viewChart, exportToFile, showEditModal, showDeleteConfirm]
  );

  return (
    <div className="files-container">
      <div className="files">
        <Select
          showSearch
          style={{ width: 200, marginBottom: 20 }}
          defaultValue="all"
          placeholder="Select a company"
          onChange={(value) => setSelectedCompany(value)}
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          <Option value="all">All Companies</Option>
          {companies.map((companyName) => (
            <Option key={companyName} value={companyName}>
              {companyName}
            </Option>
          ))}
        </Select>
        <DatePicker
          style={{ width: 200, marginLeft: 20 }}
          onChange={handleDateChange}
          disabledDate={disabledDates}
          format="YYYY-MM-DD"
          placeholder="Select a date"
        />
        {loading ? (
          <Spin size="large" className="spinner" />
        ) : (
          <Table
            columns={columns}
            dataSource={files.filter((file) => {
              const companyMatch =
                selectedCompany === "all" ||
                file.companyName === selectedCompany;
              const dateMatch = selectedDate
                ? moment(file.createdAt).format("YYYY-MM-DD") ===
                selectedDate.format("YYYY-MM-DD")
                : true;
              return companyMatch && dateMatch;
            })}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
          />
        )}
      </div>
      {selectedChartData && (
        <ChartDisplay
          jsonData={selectedChartData}
          fileName={selectedFileName}
        />
      )}
      <Modal
        title={`Edit Headers for ${editingFileName}`}
        open={editModalVisible}
        onOk={editHeaders}
        onCancel={() => setEditModalVisible(false)}
      >
        <Input.TextArea
          rows={4}
          value={editedHeaders}
          onChange={(e) => setEditedHeaders(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default Files;

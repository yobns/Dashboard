import { useEffect, useState } from "react";
import { Button, Modal, Select, Spin, Table } from "antd";
import axios from "axios";
import "./Files.css";
import { useNavigate } from "react-router-dom";
import {
  PieChartOutlined,
  DownloadOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

const { Option } = Select;

const Files = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/file/getFiles`,
        { withCredentials: true }
      );
      setFiles(response.data);
    } catch (error) {
      console.error("Error fetching files", error);
    } finally {
      setLoading(false);
    }
  };

  const exportToFile = async (fileName) => {
    window.open(
      `${import.meta.env.VITE_SERVER_URL}/file/export/${fileName}`,
      "_blank"
    );
  };

  const deleteFile = async (fileName) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_SERVER_URL}/file/delete/${fileName}`,
        { withCredentials: true }
      );

      await fetchFiles();
    } catch (error) {
      console.log(error);
    }
  };

  const showDeleteConfirm = (fileName) => {
    Modal.confirm({
      title: (
        <div>
          <span style={{ color: "#faad14" }}>Delete File: </span>
          <span>{fileName}</span>
        </div>
      ),
      icon: <DeleteOutlined />,
      content: (
        <div>
          <p>Are you sure ?</p>
          <p style={{ color: 'grey' }}>This action cannot be undone.</p>
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
  };

  const filteredFiles = files.filter((file) =>
    selectedCompany === "all" ? true : file.companyName === selectedCompany
  );

  const companyOptions = Array.from(new Set(files.map((file) => file.companyName)))
    .sort()
    .map((company) => <Option key={company} value={company}>{company}</Option>);

  const columns = [
    {
      title: "Name",
      dataIndex: "fileName",
      key: "fileName",
    },
    {
      title: "Company",
      dataIndex: "companyName",
      key: "companyName",
    },
    {
      key: "action",
      align: "center",
      render: (_, record) => (
        <>
          <Button
            type="link"
            title="View Data"
            onClick={() => navigate(`/data/${record.fileName}`)}
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
            title="Delete File"
            onClick={() => showDeleteConfirm(record.fileName)}
          >
            <DeleteOutlined />
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className="files-container">
      {loading && <Spin size="large" className="spinner" />}
      <div className="files">
        <h2 className="filesTitle">Files</h2>
        <Select
          showSearch
          style={{ width: 200, marginBottom: 20 }}
          defaultValue="all"
          placeholder="Select a company"
          optionFilterProp="children"
          onChange={(value) => setSelectedCompany(value)}
          filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        >
          <Option value="all">All Companies</Option>
          {companyOptions}
        </Select>

        {loading ? (
          null
        ) : (
          <Table
            columns={columns}
            dataSource={filteredFiles}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
          />
        )}
      </div>
    </div>
  );
};

export default Files;
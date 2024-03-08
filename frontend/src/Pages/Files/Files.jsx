import { useEffect, useState } from "react";
import { Button, Modal, Spin, Table } from "antd";
import axios from "axios";
import "./Files.css";
import { useNavigate } from "react-router-dom";
import {
  EyeOutlined,
  DownloadOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

const Files = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

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
      title: `Delete File: ${fileName}`,
      content:
        "Are you sure you want to delete this file? This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      centered: true,
      onOk() {
        deleteFile(fileName);
      },
    });
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "fileName",
      key: "fileName",
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_, record) => (
        <>
          <Button
            type="link"
            title="View Data"
            onClick={() => navigate(`/data/${record.fileName}`)}
          >
            <EyeOutlined />
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
        {loading ? (
          null
        ) : (
          <Table
            columns={columns}
            dataSource={files}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
          />
        )}
      </div>
    </div>
  );
};

export default Files;
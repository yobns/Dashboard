import { useState, useEffect } from "react";
import { Input, Avatar, Alert } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { NavLink, useParams } from "react-router-dom";
import axios from "axios";
import "./Navbar.css";

const { Search } = Input;

const Navbar = ({ isSidebarCollapsed }) => {
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { fileName } = useParams();

  useEffect(() => {
    const firstName = localStorage.getItem("firstName") || "";
    const lastName = localStorage.getItem("lastName") || "";
    setFullName(`${firstName} ${lastName}`);
    setRole(localStorage.getItem("role") || "");

    const handleFirstNameUpdated = () => {
      setFullName(
        `${localStorage.getItem("firstName")} ${localStorage.getItem(
          "lastName"
        )}`
      );
    };

    window.addEventListener("updated", handleFirstNameUpdated);
    return () => {
      window.removeEventListener("updated", handleFirstNameUpdated);
    };
  }, []);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/file/getFiles`,
          { withCredentials: true }
        );
        setData(response.data);

        if (fileName) {
          setSearchTerm(fileName);
          const fileToDisplay = response.data.find(
            (file) => file.fileName === fileName
          );
          if (fileToDisplay) {
            await handleChange(fileName);
          }
        }
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };
    fetchFiles();
  }, [fileName]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    const filtered = data.filter((file) =>
      file.fileName.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const handleChange = async (value) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/file/${value}`,
        { withCredentials: true }
      );
      setFilteredData([response.data]);
      setSearchTerm("");
    } catch (error) {
      console.error("Error fetching file data:", error);
    }
  };

  const searchResultsStyle = {
    right: isSidebarCollapsed ? "84.7%" : "78.5%",
  };

  return (
    <div className="navbar">
      <Search
        placeholder="Search..."
        style={{ width: 200 }}
        onSearch={handleSearch}
        onChange={(e) => handleSearch(e.target.value)}
        value={searchTerm}
      />
      {searchTerm.trim() !== "" && (
        <div
          className={`files-slider ${filteredData.length > 0 ? "" : "hide"}`}
          style={searchResultsStyle}
        >
          {filteredData.length > 0 ? (
            filteredData.map((file) => (
              <div key={file.fileName} className="files-slider-item ">
                <NavLink to={`/data/${file.fileName}`}>{file.fileName}</NavLink>
              </div>
            ))
          ) : (
            <Alert message="No results found" type="error" showIcon />
          )}
        </div>
      )}
      <div className="user-info">
        <Avatar size={32} icon={<UserOutlined />} />
        <div className="user-details">
          <p className="user-name">{fullName}</p>
          <p className="user-role">{role}</p>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
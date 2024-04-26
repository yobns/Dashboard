import { useState, useEffect, useCallback, useContext } from "react";
import { Input, Avatar, Alert, Spin, Menu, Dropdown } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { NavLink, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";
import { AuthContext } from "../../Context/AuthContext";

const { Search } = Input;

const Navbar = ({ isSidebarCollapsed }) => {
  const { handleUserLogout } = useContext(AuthContext);

  const [state, setState] = useState({
    fullName: "",
    role: "",
    searchTerm: "",
    searchResults: [],
    isLoading: false,
    error: null,
  });

  const { fileName } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const updateState = useCallback((newState) => {
    setState((prevState) => ({ ...prevState, ...newState }));
  }, []);

  useEffect(() => {
    const firstName = localStorage.getItem("firstName") || "";
    const lastName = localStorage.getItem("lastName") || "";
    updateState({
      fullName: `${firstName} ${lastName}`,
      role: localStorage.getItem("role") || "",
    });
  }, [updateState]);

  useEffect(() => {
    if (fileName) {
      updateState({ searchTerm: fileName });
    }

    return () => {
      updateState({ searchTerm: "", searchResults: [] });
    };
  }, [fileName, updateState]);

  useEffect(() => {
    const handleSearch = async () => {
      try {
        updateState({ isLoading: true, error: null });
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/file/search/${state.searchTerm}`,
          { withCredentials: true }
        );
        updateState({ searchResults: response.data, isLoading: false });
      } catch (error) {
        console.error("Error searching files:", error);
        updateState({
          isLoading: false,
          error: "An error occurred while searching files.",
        });
      }
    };

    const timeoutId = setTimeout(() => {
      if (state.searchTerm.trim() !== "") {
        handleSearch();
      }
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [state.searchTerm, updateState]);

  useEffect(() => {
    updateState({ searchTerm: "", searchResults: [] });
  }, [location, updateState]);

  const handleSearch = (value) => {
    updateState({ searchTerm: value });
  };
  const menuItems = [
    {
      key: "Account",
      icon: <UserOutlined />,
      label: "Account",
      onClick: () => navigate("/account"),
    },
    {
      key: "Logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: handleUserLogout,
    },
  ];
  return (
    <div className="navbar">
      <Search
        placeholder="Search..."
        style={{ width: 300 }}
        onSearch={handleSearch}
        onChange={(e) => updateState({ searchTerm: e.target.value })}
        value={state.searchTerm}
      />
      {state.searchTerm.trim() !== "" && (
        <div
          className={`files-slider ${
            state.searchResults.length > 0 ? "" : "hide"
          }`}
          style={{ right: isSidebarCollapsed ? "84.7%" : "78.5%" }}
        >
          {state.isLoading ? (
            <Spin />
          ) : state.searchResults.length > 0 ? (
            state.searchResults.map((file, index) => (
              <div key={file.fileName || index} className="files-slider-item">
                <NavLink to={`/files/${file.fileName}`}>
                  {file.fileName}
                </NavLink>
              </div>
            ))
          ) : (
            <Alert
              message={state.error || "No results found"}
              type="error"
              showIcon
            />
          )}
        </div>
      )}
      <div className="user-info">
        <Dropdown
          overlay={<Menu items={menuItems} />}
          trigger={["click"]}
          arrow={{ pointAtCenter: true }}
        >
          <Avatar size={32} icon={<UserOutlined />} className="avatar-hover" />
        </Dropdown>
        <div className="user-details">
          <p className="user-name">{state.fullName}</p>
          <p className="user-role">{state.role}</p>
        </div>
      </div>
    </div>
  );
};

export default Navbar;

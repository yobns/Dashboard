import "./Dashboard.css";
import { Layout, theme } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Menu, Button } from "antd";
import {
  HomeOutlined,
  FileExcelOutlined,
  UserOutlined,
  PieChartOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useContext, useState } from "react";
import Logo from "../Logo/Logo";
import Navbar from "../Navbar/Navbar";
import { AuthContext } from "../../Context/AuthContext";
import DashboardContent from "../DashboardContent/DashboardContent";
import { Content } from "antd/es/layout/layout";
import { useLocation, useNavigate } from "react-router-dom";
const { Header, Sider } = Layout;

const Dashboard = () => {
  const { handleUserLogout } = useContext(AuthContext);
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const navigate = useNavigate();
  const location = useLocation();

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.includes("/files")) return "files";
    if (path.includes("/data")) return "data";
    if (path.includes("/account")) return "account";
    return "home";
  };

  const menuItems = [
    {
      key: "home",
      icon: <HomeOutlined />,
      label: "Home",
      onClick: () => navigate("/"),
    },
    {
      key: "files",
      icon: <FileExcelOutlined />,
      label: "Files",
      onClick: () => navigate("/files"),
    },
    {
      key: "data",
      icon: <PieChartOutlined />,
      label: "Data",
      onClick: () => navigate("/data"),
    },
    {
      key: "account",
      icon: <UserOutlined />,
      label: "Account",
      onClick: () => navigate("/account"),
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: handleUserLogout,
    },
  ];

  return (
    <Layout>
      <Sider
        collapsed={collapsed}
        collapsible
        trigger={null}
        className="sidebar"
      >
        <Logo />
        <Menu
          theme={"dark"}
          className="menu-bar"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Navbar />
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <Button
            type="text"
            className="toggle"
            onClick={() => setCollapsed(!collapsed)}
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          />
        </Header>
        <Content>
          <DashboardContent />
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;

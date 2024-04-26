import { useState, useMemo } from "react";
import { Layout, Button, Menu } from "antd";
import {
  HomeOutlined,
  FileExcelOutlined,
  BankOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import "./Dashboard.css";
import Logo from "../Logo/Logo";
import Navbar from "../Navbar/Navbar";
import DashboardContent from "../DashboardContent/DashboardContent";

const { Header, Sider, Content } = Layout;

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const getSelectedKey = () => {
    const path = location.pathname;
    return path.includes("/files")
      ? "Files"
      : path.includes("/companies")
      ? "Companies"
      : path.includes("/account")
      ? "Account"
      : "Home";
  };

  const menuItems = useMemo(
    () => [
      {
        key: "Home",
        icon: <HomeOutlined />,
        label: "Home",
        onClick: () => navigate("/"),
      },
      {
        key: "Files",
        icon: <FileExcelOutlined />,
        label: "Files",
        onClick: () => navigate("/files"),
      },
      {
        key: "Companies",
        icon: <BankOutlined />,
        label: "Companies",
        onClick: () => navigate("/companies"),
      },
      {
        key: "Account",
        icon: <UserOutlined />,
        label: "Account",
        onClick: () => navigate("/account"),
      },
    ],
    [navigate]
  );

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
          theme="dark"
          className="menu-bar"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Navbar />
        <Header style={{ padding: 0, background: "var(--color-bg-container)" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Button
              type="text"
              className="toggle"
              onClick={() => setCollapsed(!collapsed)}
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            />
            <h1 className="pageName">{getSelectedKey()}</h1>
          </div>
        </Header>
        <Content>
          <DashboardContent />
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;

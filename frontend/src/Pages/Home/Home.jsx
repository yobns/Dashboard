import { Link } from "react-router-dom";
import {
  FileExcelOutlined,
  BankOutlined,
  UserOutlined,
} from "@ant-design/icons";
import "./Home.css";
import FileUpload from "../../Components/FileUpload/FileUpload";

const CircleLink = ({ to, icon, text }) => (
  <Link to={to}>
    <div className="circle">{icon}</div>
    <div className="circle-text">{text}</div>
  </Link>
);

const Home = () => {
  return (
    <div className="dashboard-container">
      <FileUpload />
      <div className="circle-container">
        <CircleLink
          to="/files"
          icon={<FileExcelOutlined style={{ fontSize: "30px" }} />}
          text="Files"
        />
        <CircleLink
          to="/companies"
          icon={<BankOutlined style={{ fontSize: "30px" }} />}
          text="Companies"
        />
        <CircleLink
          to="/account"
          icon={<UserOutlined style={{ fontSize: "30px" }} />}
          text="Account"
        />
      </div>
    </div>
  );
};

export default Home;

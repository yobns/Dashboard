import { useNavigate } from "react-router-dom";
import "./Logo.css";
import { FireFilled } from "@ant-design/icons";

const Logo = () => {
  const navigate = useNavigate();

  return (
    <div className="logo" onClick={() => navigate("/")}>
      <div className="logo-icon">
        <FireFilled />
      </div>
    </div>
  );
};

export default Logo;

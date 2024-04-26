import { useNavigate } from "react-router-dom";
import "./Logo.css";
import { FireFilled } from "@ant-design/icons";

const Logo = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/");
  };

  return (
    <div className="logo" onClick={handleClick}>
      <div className="logo-icon">
        <FireFilled />
      </div>
    </div>
  );
};

export default Logo;

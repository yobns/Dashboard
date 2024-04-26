import { Result, Button } from "antd";
import { Link } from "react-router-dom";
import "./NotFound.css";

const NotFound = () => {
  return (
    <div className="notFoundContainer">
      <Result
        status="404"
        title="404"
        subTitle="Sorry, this page does not exist."
        extra={
          <Link to="/">
            <Button type="primary">Back to Home</Button>
          </Link>
        }
      />
    </div>
  );
};

export default NotFound;

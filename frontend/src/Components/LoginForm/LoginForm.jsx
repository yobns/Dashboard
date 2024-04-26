import { Form, Input, Button } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useContext } from "react";
import { AuthContext } from "../../Context/AuthContext";
import "./LoginForm.css";

const LoginForm = () => {
  const { handleSubmitLogin, errorMessage } = useContext(AuthContext);

  return (
    <Form className="LogInForm" onFinish={handleSubmitLogin}>
      <div className="login-container">
        <Form.Item
          name="email"
          rules={[
            {
              required: true,
              message: "Please enter your email",
            },
          ]}
        >
          <Input
            prefix={<UserOutlined className="site-form-item-icon" />}
            type="email"
            placeholder="Enter email"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            {
              required: true,
              message: "Please enter your password",
            },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="site-form-item-icon" />}
            placeholder="Password"
          />
        </Form.Item>

        <div>
          {errorMessage && (
            <div className="text-danger mb-1 error-wrapper">{errorMessage}</div>
          )}
          <Button type="primary" htmlType="submit" className="buttonModal mt-3">
            Log In
          </Button>
        </div>
      </div>
    </Form>
  );
};

export default LoginForm;

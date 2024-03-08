import { createContext, useState } from "react";
import { Form, Input, Button } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import "./AuthContext.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(
    !!localStorage.getItem("token")
  );
  const navigate = useNavigate();

  const handleUserLogout = async () => {
    try {
      await axios.get(`${import.meta.env.VITE_SERVER_URL}/logout`, {
        withCredentials: true,
      });
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      localStorage.clear();
      setIsUserLoggedIn(false);
      navigate("/");
    }
  };

  const handleSubmitLogin = async (values) => {
    const { email, password } = values;
    const userData = { email, password };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/login`,
        userData,
        {
          withCredentials: true,
        }
      );

      if (response.data.ok) {
        const { token, user } = response.data;
        localStorage.setItem("token", token);
        localStorage.setItem("firstName", user.firstName);
        localStorage.setItem("lastName", user.lastName);
        localStorage.setItem("role", user.role);
        localStorage.setItem("id", user._id);
        setIsUserLoggedIn(true);
        navigate("/");
      }
    } catch (error) {
      console.error("Login failed:", error);
      setErrorMessage("Invalid email or password");
    }
  };

  const LoginForm = (
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

  return (
    <AuthContext.Provider
      value={{
        isUserLoggedIn,
        handleUserLogout,
        LoginForm,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

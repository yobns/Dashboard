import { useState, useCallback } from "react";
import { Form, Input, Button, Select, message } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

const SignupForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const signupUser = useCallback(
    async (values) => {
      setLoading(true);
      try {
        await axios.post(`${import.meta.env.VITE_SERVER_URL}/signup`, values);
        message.success("Profile created successfully!");
        navigate("/");
      } catch (error) {
        console.error("Error during signup:", error);
        message.error(
          error.response?.data?.message || "Failed to create profile"
        );
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  return (
    <Form
      form={form}
      layout="vertical"
      className="updateForm"
      onFinish={signupUser}
    >
      <Form.Item
        name="email"
        label="Email"
        rules={[{ required: true, message: "Please input your email!" }]}
      >
        <Input className="rounded-input" autoComplete="new-email" />
      </Form.Item>
      <Form.Item
        name="firstName"
        label="First Name"
        rules={[{ required: true, message: "Please input your first name!" }]}
      >
        <Input className="rounded-input" />
      </Form.Item>
      <Form.Item
        name="lastName"
        label="Last Name"
        rules={[{ required: true, message: "Please input your last name!" }]}
      >
        <Input className="rounded-input" />
      </Form.Item>
      <Form.Item
        name="password"
        label="Password"
        rules={[{ required: true, message: "Please input your password!" }]}
      >
        <Input.Password autoComplete="new-password" />
      </Form.Item>
      <Form.Item
        name="role"
        label="Role"
        rules={[{ required: true, message: "Please select a role!" }]}
      >
        <Select>
          <Option value="admin">Admin</Option>
          <Option value="user">User</Option>
        </Select>
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Create
        </Button>
      </Form.Item>
    </Form>
  );
};

export default SignupForm;

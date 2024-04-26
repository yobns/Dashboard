import { useState, useEffect } from "react";
import { Form, Input, Button, message, Menu } from "antd";
import axios from "axios";
import "./Account.css";
import SignupForm from "../../Components/signupForm/signupForm";
import { useNavigate } from "react-router-dom";
import UsersList from "../../Components/UserList/UserList";

const Profile = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("update");
  const id = localStorage.getItem("id");
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/user/${id}`,
          { withCredentials: true }
        );
        form.setFieldsValue({
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
        });
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        message.error("Failed to load profile data.");
      }
    };
    fetchUserData();
  }, [form, id]);

  const onFinish = async (values) => {
    if (!values.password) delete values.password;

    try {
      setLoading(true);
      await axios.put(`${import.meta.env.VITE_SERVER_URL}/user/${id}`, values, {
        withCredentials: true,
      });
      const { firstName, lastName } = values;
      localStorage.setItem("firstName", firstName);
      localStorage.setItem("lastName", lastName);
      window.dispatchEvent(new Event("updated"));
      message.success("Profile updated successfully!");
      navigate("/");
    } catch (error) {
      console.error("There was an error updating the profile:", error);
      message.error("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (e) => {
    setSelectedMenu(e.key);
  };

  const menuItems = [
    { key: "update", label: "Update Profile" },
    ...(role === "admin"
      ? [
          { key: "create", label: "Create Profile" },
          { key: "users", label: "Users List" },
        ]
      : []),
  ];

  return (
    <div className="accountContainer">
      <Menu
        mode="horizontal"
        className="menuAccount"
        selectedKeys={[selectedMenu]}
        onClick={handleMenuClick}
        items={menuItems}
      />
      {selectedMenu === "update" && (
        <Form
          form={form}
          name="profile"
          onFinish={onFinish}
          layout="vertical"
          className="updateForm"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              {
                required: true,
                message: "Please input your email!",
                type: "email",
              },
            ]}
          >
            <Input className="rounded-input" />
          </Form.Item>
          <Form.Item
            label="First Name"
            name="firstName"
            rules={[
              { required: true, message: "Please input your first name!" },
            ]}
          >
            <Input className="rounded-input" />
          </Form.Item>
          <Form.Item
            label="Last Name"
            name="lastName"
            rules={[
              { required: true, message: "Please input your last name!" },
            ]}
          >
            <Input className="rounded-input" />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: false }]}
          >
            <Input.Password
              placeholder="Leave blank to keep your password."
              autoComplete="new-password"
              className="rounded-input"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Update
            </Button>
          </Form.Item>
        </Form>
      )}
      {selectedMenu === "create" && <SignupForm />}
      {selectedMenu === "users" && <UsersList />}
    </div>
  );
};

export default Profile;

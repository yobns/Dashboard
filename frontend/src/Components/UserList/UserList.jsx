import { useEffect, useState } from "react";
import { Table, message } from "antd";
import axios from "axios";

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/users`,
          { withCredentials: true }
        );
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        message.error("Failed to load users data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const columns = [
    { title: "First Name", dataIndex: "firstName", key: "firstName" },
    { title: "Last Name", dataIndex: "lastName", key: "lastName" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Role", dataIndex: "role", key: "role" },
  ];

  return (
    <Table
      dataSource={users}
      columns={columns}
      rowKey="_id"
      loading={loading}
      style={{ marginTop: "30px" }}
      pagination={{ pageSize: 10 }}
    />
  );
};

export default UsersList;

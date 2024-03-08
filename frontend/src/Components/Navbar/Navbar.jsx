import React, { useState, useEffect } from 'react';
import { Input, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import './Navbar.css';

const { Search } = Input;

const Navbar = () => {
  const [fullName, setFullName] = useState(localStorage.getItem('firstName') + ' ' + localStorage.getItem('lastName'));
  const [role, setRole] = useState(localStorage.getItem('role'));

  useEffect(() => {
    const handleFirstNameUpdated = () => {
      setFullName(localStorage.getItem('firstName') + ' ' + localStorage.getItem('lastName'));
    };

    window.addEventListener('updated', handleFirstNameUpdated);
    return () => { window.removeEventListener('updated', handleFirstNameUpdated) };
  }, []);

  return (
    <div className="navbar">
      <Search placeholder="Search..." style={{ width: 200 }} />
      <div className="user-info">
        <Avatar size={32} icon={<UserOutlined />} />
        <div className="user-details">
          <p className="user-name">{fullName}</p>
          <p className="user-role">{role}</p>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
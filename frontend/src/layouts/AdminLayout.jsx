import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Typography, Dropdown, Badge } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  TeamOutlined,
  BarChartOutlined,
  TagsOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';

const { Header, Sider, Content, Footer } = Layout;
const { Title, Text } = Typography;

const StyledLayout = styled(Layout)`
  min-height: 100vh;
`;

const StyledHeader = styled(Header)`
  padding: 0 24px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  z-index: 1;
`;

const LogoContainer = styled.div`
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

const Logo = styled.div`
  color: white;
  font-size: 18px;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledContent = styled(Content)`
  margin: 24px;
  padding: 24px;
  background: white;
  border-radius: 4px;
  min-height: auto;
  overflow: auto;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
`;

const UserName = styled(Text)`
  margin-left: 8px;
  margin-right: 8px;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const TriggerButton = styled(Button)`
  margin-right: 24px;
`;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  const userDropdownItems = [
    {
      key: 'profile',
      label: 'My Profile',
      icon: <UserOutlined />,
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: <SettingOutlined />,
      onClick: () => navigate('/admin/settings'),
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];
  
  const notificationItems = [
    {
      key: '1',
      label: 'New complaint submitted',
    },
    {
      key: '2',
      label: 'Complaint requires attention',
    },
    {
      key: '3',
      label: 'Employee assignment pending',
    },
  ];
  
  return (
    <StyledLayout>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        collapsedWidth={80}
        width={250}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'sticky',
          top: 0,
          left: 0,
        }}
      >
        <LogoContainer>
          <Logo>
            {collapsed ? 'Admin' : 'Admin Dashboard'}
          </Logo>
        </LogoContainer>
        
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={[
            {
              key: '/admin/dashboard',
              icon: <DashboardOutlined />,
              label: 'Dashboard',
              onClick: () => navigate('/admin/dashboard'),
            },
            {
              key: '/admin/complaints',
              icon: <FileTextOutlined />,
              label: 'Complaints',
              onClick: () => navigate('/admin/complaints'),
            },
            {              key: '/admin/staff',
              icon: <TeamOutlined />,
              label: 'Employee Management',
              onClick: () => navigate('/admin/staff'),
            },
            {
              key: '/admin/users',
              icon: <UserOutlined />,
              label: 'User Management',
              onClick: () => navigate('/admin/users'),
            },
            {
              key: '/admin/reports',
              icon: <BarChartOutlined />,
              label: 'Reports',
              onClick: () => navigate('/admin/reports'),
            },
            {
              key: '/admin/categories',
              icon: <TagsOutlined />,
              label: 'Categories',
              onClick: () => navigate('/admin/categories'),
            },
          ]}
        />
      </Sider>
      
      <Layout>
        <StyledHeader>
          <TriggerButton
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          
          <UserInfo>
            <Dropdown
              menu={{
                items: notificationItems,
              }}
              placement="bottomRight"
              arrow
            >
              <Badge count={5} size="small">
                <Button type="text" icon={<BellOutlined />} shape="circle" />
              </Badge>
            </Dropdown>
            
            <Dropdown
              menu={{
                items: userDropdownItems,
              }}
              placement="bottomRight"
              arrow
            >
              <UserInfo style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} src={user?.avatar} style={{ backgroundColor: '#1890ff' }} />
                <UserName strong>{user?.name}</UserName>
              </UserInfo>
            </Dropdown>
          </UserInfo>
        </StyledHeader>
        
        <StyledContent>
          <Outlet />
        </StyledContent>
        
        <Footer style={{ textAlign: 'center' }}>
          Complaint Management System ©{new Date().getFullYear()} Created by Your Company
        </Footer>
      </Layout>
    </StyledLayout>
  );
};

export default AdminLayout;
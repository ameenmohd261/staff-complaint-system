import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Typography, Dropdown, Badge } from 'antd';
import {
  HomeOutlined,
  FileAddOutlined,
  FileTextOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined
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

const UserLayout = () => {
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
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];
  
  const notificationItems = [
    {
      key: '1',
      label: 'Your complaint has been updated',
    },
    {
      key: '2',
      label: 'New comment on your complaint',
    },
    {
      key: '3',
      label: 'Your complaint has been resolved',
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
            {collapsed ? 'CMS' : 'Complaint Management'}
          </Logo>
        </LogoContainer>
        
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={[
            {
              key: '/dashboard',
              icon: <HomeOutlined />,
              label: 'Dashboard',
              onClick: () => navigate('/dashboard'),
            },
            {
              key: '/new-complaint',
              icon: <FileAddOutlined />,
              label: 'New Complaint',
              onClick: () => navigate('/new-complaint'),
            },
            {
              key: '/complaints',
              icon: <FileTextOutlined />,
              label: 'My Complaints',
              onClick: () => navigate('/complaints'),
            },
            {
              key: '/profile',
              icon: <UserOutlined />,
              label: 'My Profile',
              onClick: () => navigate('/profile'),
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
              <Badge count={3} size="small">
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
                <Avatar icon={<UserOutlined />} src={user?.avatar} />
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

export default UserLayout;
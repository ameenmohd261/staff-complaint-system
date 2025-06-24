import React from 'react';
import { Layout, Typography } from 'antd';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';

const { Content } = Layout;
const { Title } = Typography;

const StyledLayout = styled(Layout)`
  min-height: 100vh;
  background: linear-gradient(135deg, #1890ff 0%, #722ed1 100%);
`;

const ContentWrapper = styled(Content)`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
`;

const AuthCard = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 420px;
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 24px;
`;

const AuthLayout = () => {
  const { user } = useAuth();
  
  // Redirect if user is already logged in
  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
  }
  
  return (
    <StyledLayout>
      <ContentWrapper>
        <AuthCard>
          <Logo>
            <Title level={2} style={{ color: '#1890ff', margin: 0 }}>
              Complaint Management
            </Title>
          </Logo>
          <Outlet />
        </AuthCard>
      </ContentWrapper>
    </StyledLayout>
  );
};

export default AuthLayout;
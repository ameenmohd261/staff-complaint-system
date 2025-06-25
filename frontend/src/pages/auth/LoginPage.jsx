import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styled from 'styled-components';

const { Title, Text } = Typography;

const StyledForm = styled(Form)`
  .ant-form-item-label {
    font-weight: 500;
  }
`;

const FormFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
`;

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
    const onFinish = async (values) => {
    setLoading(true);
    try {
      const user = await login(values.email, values.password);
      
      // Use setTimeout to avoid the antd warning
      setTimeout(() => {
        message.success('Login successful!');
      }, 100);
      
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      
      // Use setTimeout to avoid the antd warning
      setTimeout(() => {
        message.error(error.message || 'Login failed. Please check your credentials.');
      }, 100);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
        Log In
      </Title>
      
      <StyledForm
        name="login"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        layout="vertical"
        size="large"
      >
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Please enter your email' },
            { type: 'email', message: 'Please enter a valid email' }
          ]}
        >
          <Input prefix={<UserOutlined />} placeholder="Email" />
        </Form.Item>
        
        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: 'Please enter your password' }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Password" />
        </Form.Item>
        
        <Form.Item>
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>Remember me</Checkbox>
          </Form.Item>
          
          <a style={{ float: 'right' }} href="#">
            Forgot password?
          </a>
        </Form.Item>
        
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
          >
            Log In
          </Button>
        </Form.Item>
        
        <FormFooter>
          <Text>Don't have an account?</Text>
          <Link to="/register">Register now</Link>
        </FormFooter>
        
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Text type="secondary">Demo Accounts:</Text>
          <div style={{ marginTop: 8 }}>
            <Text code>Admin: admin@example.com / admin123</Text>
          </div>
          <div style={{ marginTop: 4 }}>
            <Text code>User: user@example.com / user123</Text>
          </div>
        </div>
      </StyledForm>
    </>
  );
};

export default LoginPage;
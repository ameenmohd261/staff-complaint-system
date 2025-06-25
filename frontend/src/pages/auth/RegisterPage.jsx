import React, { useState } from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
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

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
    const onFinish = async (values) => {
    setLoading(true);
    try {
      // Remove confirm password field
      const { confirmPassword, ...userData } = values;
        // IMPORTANT: Explicitly set role to 'employee' (backend only accepts 'employee' or 'admin')
      // The backend registration tries to set 'user' which causes a validation error
      userData.role = 'employee';
      
      console.log('Registering user with data:', { ...userData, password: '[REDACTED]' });
      
      const user = await register(userData);
      console.log('Registration successful:', user);
      
      // Use App's message API to avoid the antd warning
      setTimeout(() => {
        message.success('Registration successful!');
      }, 100);
      
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      
      // Use App's message API to avoid the antd warning
      setTimeout(() => {
        message.error(error.message || 'Registration failed. Please try again.');
      }, 100);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
        Create an Account
      </Title>
      
      <StyledForm
        name="register"
        onFinish={onFinish}
        layout="vertical"
        size="large"
      >
        <Form.Item
          name="name"
          label="Full Name"
          rules={[{ required: true, message: 'Please enter your full name' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Full Name" />
        </Form.Item>
        
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Please enter your email' },
            { type: 'email', message: 'Please enter a valid email' }
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="Email" />
        </Form.Item>
        
        <Form.Item
          name="phone"
          label="Phone Number"
          rules={[{ required: true, message: 'Please enter your phone number' }]}
        >
          <Input prefix={<PhoneOutlined />} placeholder="Phone Number" />
        </Form.Item>
        
        <Form.Item
          name="password"
          label="Password"
          rules={[
            { required: true, message: 'Please enter your password' },
            { min: 6, message: 'Password must be at least 6 characters' }
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Password" />
        </Form.Item>
        
        <Form.Item
          name="confirmPassword"
          label="Confirm Password"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Please confirm your password' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('The two passwords do not match'));
              },
            }),
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Confirm Password" />
        </Form.Item>
        
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
          >
            Register
          </Button>
        </Form.Item>
        
        <FormFooter>
          <Text>Already have an account?</Text>
          <Link to="/login">Log in</Link>
        </FormFooter>
      </StyledForm>
    </>
  );
};

export default RegisterPage;
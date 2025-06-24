import React, { useState } from 'react';
import { 
  Card, Form, Input, Button, Tabs, Typography, 
  Divider, Avatar, message, Switch, Space
} from 'antd';
import { 
  UserOutlined, LockOutlined, MailOutlined, 
  PhoneOutlined, SaveOutlined, BellOutlined,
  KeyOutlined, EditOutlined 
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import styled from 'styled-components';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const StyledCard = styled(Card)`
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  
  @media (max-width: 576px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const ProfileAvatar = styled(Avatar)`
  margin-right: 24px;
  background-color: #1890ff;
  
  @media (max-width: 576px) {
    margin-right: 0;
    margin-bottom: 16px;
  }
`;

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
  // Initialize form with user data
  React.useEffect(() => {
    if (user) {
      profileForm.setFieldsValue({
        name: user.name,
        email: user.email,
        phone: user.phone
      });
    }
  }, [user, profileForm]);
  
  const handleProfileUpdate = async (values) => {
    setLoading(true);
    try {
      await updateProfile(values);
      message.success('Profile updated successfully');
    } catch (error) {
      message.error('Failed to update profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handlePasswordChange = async (values) => {
    setLoading(true);
    try {
      await updateProfile({ password: values.newPassword });
      message.success('Password changed successfully');
      passwordForm.resetFields();
    } catch (error) {
      message.error('Failed to change password: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <Title level={2}>My Profile</Title>
      
      <StyledCard>
        <ProfileHeader>
          <ProfileAvatar size={80} icon={<UserOutlined />} src={user?.avatar} />
          <div>
            <Title level={3} style={{ margin: 0 }}>{user?.name}</Title>
            <Text type="secondary">{user?.email}</Text>
          </div>
        </ProfileHeader>
        
        <Tabs defaultActiveKey="profile">
          <TabPane 
            tab={
              <span>
                <UserOutlined />
                Personal Information
              </span>
            } 
            key="profile"
          >
            <Form
              form={profileForm}
              layout="vertical"
              onFinish={handleProfileUpdate}
            >
              <Form.Item
                name="name"
                label="Full Name"
                rules={[{ required: true, message: 'Please enter your name' }]}
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
                <Input prefix={<MailOutlined />} placeholder="Email" disabled />
              </Form.Item>
              
              <Form.Item
                name="phone"
                label="Phone Number"
                rules={[{ required: true, message: 'Please enter your phone number' }]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="Phone Number" />
              </Form.Item>
              
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={loading}
                >
                  Save Changes
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
          
          <TabPane
            tab={
              <span>
                <KeyOutlined />
                Change Password
              </span>
            }
            key="password"
          >
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handlePasswordChange}
            >
              <Form.Item
                name="currentPassword"
                label="Current Password"
                rules={[{ required: true, message: 'Please enter your current password' }]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Current Password" />
              </Form.Item>
              
              <Form.Item
                name="newPassword"
                label="New Password"
                rules={[
                  { required: true, message: 'Please enter your new password' },
                  { min: 6, message: 'Password must be at least 6 characters' }
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="New Password" />
              </Form.Item>
              
              <Form.Item
                name="confirmPassword"
                label="Confirm New Password"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Please confirm your new password' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('The two passwords do not match'));
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Confirm New Password" />
              </Form.Item>
              
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={loading}
                >
                  Change Password
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
          
          <TabPane
            tab={
              <span>
                <BellOutlined />
                Notifications
              </span>
            }
            key="notifications"
          >
            <div>
              <Title level={4}>Email Notifications</Title>
              <Paragraph type="secondary">
                Manage the email notifications you receive
              </Paragraph>
              
              <Form layout="vertical">
                <Form.Item name="email_complaint_updates" valuePropName="checked">
                  <Space align="center">
                    <Switch defaultChecked />
                    <Text>Complaint status updates</Text>
                  </Space>
                </Form.Item>
                
                <Form.Item name="email_new_comments" valuePropName="checked">
                  <Space align="center">
                    <Switch defaultChecked />
                    <Text>New comments on my complaints</Text>
                  </Space>
                </Form.Item>
                
                <Form.Item name="email_resolved_complaints" valuePropName="checked">
                  <Space align="center">
                    <Switch defaultChecked />
                    <Text>Resolved complaints</Text>
                  </Space>
                </Form.Item>
                
                <Form.Item name="email_newsletter" valuePropName="checked">
                  <Space align="center">
                    <Switch />
                    <Text>Marketing newsletters</Text>
                  </Space>
                </Form.Item>
                
                <Form.Item>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={() => message.success('Notification preferences saved')}
                  >
                    Save Preferences
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </TabPane>
        </Tabs>
      </StyledCard>
    </div>
  );
};

export default ProfilePage;
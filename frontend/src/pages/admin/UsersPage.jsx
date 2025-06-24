import React, { useState } from 'react';
import { 
  Table, Typography, Tag, Space, Button, Input, Select,
  Card, Modal, Form, Avatar, Divider, Popconfirm,
  Switch, notification, Descriptions
} from 'antd';
import { 
  UserOutlined, SearchOutlined, LockOutlined,
  EyeOutlined, StopOutlined, CheckCircleOutlined,
  MailOutlined, PhoneOutlined
} from '@ant-design/icons';
import { userService } from '../../services/userService';
import styled from 'styled-components';
import moment from 'moment';

const { Title, Text } = Typography;
const { Option } = Select;

const StyledCard = styled(Card)`
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
`;

const TableHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 16px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States for filtering
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  
  // State for view user modal
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // State for reset password modal
  const [resetPasswordVisible, setResetPasswordVisible] = useState(false);
  const [resetPasswordForm] = Form.useForm();
  const [resetting, setResetting] = useState(false);
  
  // Fetch users on component mount
  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await userService.getAllUsers();
        // Filter out admin and staff users
        const filteredUsers = data.filter(user => user.role === 'user');
        
        // Add a default status for demo purposes
        const usersWithStatus = filteredUsers.map(user => ({
          ...user,
          status: 'active'
        }));
        
        setUsers(usersWithStatus);
        setFilteredData(usersWithStatus);
      } catch (error) {
        console.error('Error fetching users:', error);
        notification.error({
          message: 'Failed to load users',
          description: error.message || 'An error occurred while fetching users'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  // Apply filters
  React.useEffect(() => {
    let result = [...users];
    
    if (searchText) {
      result = result.filter(user => 
        user.name.toLowerCase().includes(searchText.toLowerCase()) ||
        user.email.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    if (statusFilter) {
      result = result.filter(user => user.status === statusFilter);
    }
    
    setFilteredData(result);
  }, [users, searchText, statusFilter]);
  
  // Show user details
  const showUserDetails = (user) => {
    setCurrentUser(user);
    setViewModalVisible(true);
  };
  
  // Show reset password modal
  const showResetPasswordModal = (user) => {
    setCurrentUser(user);
    resetPasswordForm.resetFields();
    setResetPasswordVisible(true);
  };
  
  // Handle reset password
  const handleResetPassword = async () => {
    try {
      const values = await resetPasswordForm.validateFields();
      setResetting(true);
      
      // In a real application, this would call an API endpoint
      // For now, we'll just show a success message
      setTimeout(() => {
        notification.success({
          message: 'Password Reset',
          description: `Password has been reset for ${currentUser.name}`
        });
        setResetPasswordVisible(false);
        setResetting(false);
      }, 1000);
    } catch (error) {
      console.error('Error resetting password:', error);
    }
  };
  
  // Handle toggle user status
  const toggleUserStatus = (userId, currentStatus) => {
    // In a real application, this would call an API endpoint
    // For now, we'll just update the local state
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      )
    );
    
    notification.success({
      message: 'Status Updated',
      description: `User status has been ${newStatus === 'active' ? 'activated' : 'deactivated'}`
    });
  };
  
  // Define table columns
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} src={record.avatar} />
          {text}
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => {
        const isActive = status === 'active';
        return (
          <Tag color={isActive ? 'green' : 'red'}>
            {isActive ? 'Active' : 'Inactive'}
          </Tag>
        );
      },
    },
    {
      title: 'Joined',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: date => moment(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            size="small"
            icon={<EyeOutlined />} 
            onClick={() => showUserDetails(record)} 
          >
            View
          </Button>
          <Button 
            size="small"
            icon={<LockOutlined />} 
            onClick={() => showResetPasswordModal(record)} 
          >
            Reset
          </Button>
          <Switch 
            checkedChildren={<CheckCircleOutlined />}
            unCheckedChildren={<StopOutlined />}
            checked={record.status === 'active'}
            onChange={() => toggleUserStatus(record.id, record.status)}
          />
        </Space>
      ),
    },
  ];
  
  return (
    <div>
      <Title level={2}>User Management</Title>
      
      <StyledCard>
        <TableHeader>
          <Input
            placeholder="Search users..."
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            allowClear
          />
          
          <Select
            placeholder="Status"
            style={{ width: 130 }}
            allowClear
            value={statusFilter}
            onChange={setStatusFilter}
          >
            <Option value="active">Active</Option>
            <Option value="inactive">Inactive</Option>
          </Select>
        </TableHeader>
        
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`,
          }}
          locale={{ emptyText: 'No users found' }}
        />
      </StyledCard>
      
      {/* View User Modal */}
      <Modal
        title="User Details"
        visible={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setViewModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={600}
      >
        {currentUser && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar 
                size={80} 
                icon={<UserOutlined />} 
                src={currentUser.avatar}
                style={{ backgroundColor: '#1890ff' }}
              />
              <Title level={4} style={{ marginTop: 16, marginBottom: 0 }}>
                {currentUser.name}
              </Title>
              <Text type="secondary">{currentUser.email}</Text>
            </div>
            
            <Descriptions bordered column={1}>
              <Descriptions.Item label="User ID">{currentUser.id}</Descriptions.Item>
              <Descriptions.Item label="Phone Number">{currentUser.phone || 'Not provided'}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={currentUser.status === 'active' ? 'green' : 'red'}>
                  {currentUser.status === 'active' ? 'Active' : 'Inactive'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Registration Date">
                {moment(currentUser.createdAt).format('MMMM DD, YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Last Login">
                {moment().subtract(3, 'days').format('MMMM DD, YYYY, HH:mm')}
              </Descriptions.Item>
            </Descriptions>
            
            <Divider>Actions</Divider>
            
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                icon={<LockOutlined />}
                onClick={() => {
                  setViewModalVisible(false);
                  showResetPasswordModal(currentUser);
                }}
              >
                Reset Password
              </Button>
              
              <Button 
                danger={currentUser.status === 'active'}
                type={currentUser.status === 'active' ? 'primary' : 'default'}
                icon={currentUser.status === 'active' ? <StopOutlined /> : <CheckCircleOutlined />}
                onClick={() => {
                  toggleUserStatus(currentUser.id, currentUser.status);
                  setCurrentUser({
                    ...currentUser,
                    status: currentUser.status === 'active' ? 'inactive' : 'active'
                  });
                }}
              >
                {currentUser.status === 'active' ? 'Deactivate User' : 'Activate User'}
              </Button>
            </div>
          </>
        )}
      </Modal>
      
      {/* Reset Password Modal */}
      <Modal
        title="Reset User Password"
        visible={resetPasswordVisible}
        onCancel={() => setResetPasswordVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setResetPasswordVisible(false)}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={resetting}
            onClick={handleResetPassword}
          >
            Reset Password
          </Button>,
        ]}
      >
        {currentUser && (
          <>
            <p>You are about to reset the password for <strong>{currentUser.name}</strong>.</p>
            
            <Form
              form={resetPasswordForm}
              layout="vertical"
            >
              <Form.Item
                name="newPassword"
                label="New Password"
                rules={[
                  { required: true, message: 'Please enter a new password' },
                  { min: 6, message: 'Password must be at least 6 characters' }
                ]}
              >
                <Input.Password />
              </Form.Item>
              
              <Form.Item
                name="confirmPassword"
                label="Confirm New Password"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Please confirm the new password' },
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
                <Input.Password />
              </Form.Item>
              
              <Form.Item name="sendEmail" valuePropName="checked">
                <Switch defaultChecked /> Send password reset email to user
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </div>
  );
};

export default UsersPage;
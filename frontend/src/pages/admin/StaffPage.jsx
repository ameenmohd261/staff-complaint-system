import React, { useState } from 'react';
import { 
  Table, Typography, Tag, Space, Button, Input, Select,
  Card, Modal, Form, Avatar, Divider, Popconfirm,
  notification
} from 'antd';
import { 
  UserAddOutlined, UserOutlined, SearchOutlined,
  EditOutlined, DeleteOutlined, MailOutlined,
  PhoneOutlined, TeamOutlined, LockOutlined
} from '@ant-design/icons';
import { useApp } from '../../contexts/AppContext';
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

const StaffPage = () => {
  const { 
    staffMembers, 
    addStaffMember, 
    updateStaffMember, 
    deleteStaffMember,
    loading 
  } = useApp();
  
  // States for filtering
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState(null);
  const [filteredData, setFilteredData] = useState(staffMembers);
  
  // State for staff modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('Add New Employee');
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentStaff, setCurrentStaff] = useState(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  
  // Apply filters
  React.useEffect(() => {
    let result = [...staffMembers];
    
    if (searchText) {
      result = result.filter(staff => 
        staff.name.toLowerCase().includes(searchText.toLowerCase()) ||
        staff.email.toLowerCase().includes(searchText.toLowerCase()) ||
        (staff.department && staff.department.toLowerCase().includes(searchText.toLowerCase()))
      );
    }
    
    if (roleFilter) {
      result = result.filter(staff => staff.role === roleFilter);
    }
    
    setFilteredData(result);
  }, [staffMembers, searchText, roleFilter]);
  
  // Open modal for adding new staff
  const showAddModal = () => {
    setModalTitle('Add New Employee');
    setModalMode('add');
    setCurrentStaff(null);
    form.resetFields();
    setModalVisible(true);
  };
  
  // Open modal for editing staff
  const showEditModal = (staff) => {
    setModalTitle('Edit Staff Member');
    setModalMode('edit');
    setCurrentStaff(staff);
    
    form.setFieldsValue({
      name: staff.name,
      email: staff.email,
      role: staff.role,
      department: staff.department,
      phone: staff.phone
    });
    
    setModalVisible(true);
  };
  
  // Handle form submit
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      
      if (modalMode === 'add') {        // Add password for new staff
        values.password = 'employee123'; // Default password
        
        await addStaffMember(values);        notification.success({
          message: 'Employee Added',
          description: 'New employee has been added successfully'
        });
      } else {
        await updateStaffMember(currentStaff.id, values);        notification.success({
          message: 'Employee Updated',
          description: 'Employee has been updated successfully'
        });
      }
      
      setModalVisible(false);
    } catch (error) {
      console.error('Error saving staff:', error);
      notification.error({
        message: modalMode === 'add' ? 'Add Failed' : 'Update Failed',
        description: error.message || 'Failed to save employee'
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle staff deletion
  const handleDelete = async (staffId) => {
    try {
      await deleteStaffMember(staffId);      notification.success({
        message: 'Employee Deleted',
        description: 'Employee has been deleted successfully'
      });
    } catch (error) {
      notification.error({
        message: 'Delete Failed',
        description: error.message || 'Failed to delete employee'
      });
    }
  };
  
  // Define table columns
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
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
      title: 'Role',
      dataIndex: 'role',
      key: 'role',      render: role => {
        const color = role === 'admin' ? '#722ed1' : '#1890ff';
        return <Tag color={color}>{role}</Tag>;
      },
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      render: department => department || 'Not assigned',
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
      width: 150,
      render: (_, record) => (
        <Space>
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => showEditModal(record)} 
          />
          <Popconfirm
            title="Are you sure you want to delete this staff member?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];
  
  return (
    <div>
      <Title level={2}>Staff Management</Title>
      
      <StyledCard>
        <TableHeader>
          <Button 
            type="primary" 
            icon={<UserAddOutlined />}
            onClick={showAddModal}
          >
            Add Staff Member
          </Button>
          
          <Space>
            <Input
              placeholder="Search staff..."
              prefix={<SearchOutlined />}
              style={{ width: 250 }}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              allowClear
            />
            
            <Select
              placeholder="Role"
              style={{ width: 130 }}
              allowClear
              value={roleFilter}
              onChange={setRoleFilter}
            >              <Option value="admin">Admin</Option>
              <Option value="employee">Employee</Option>
            </Select>
          </Space>
        </TableHeader>
        
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} employees`,
          }}
          locale={{ emptyText: 'No employees found' }}
        />
      </StyledCard>
      
      {/* Add/Edit Staff Modal */}
      <Modal
        title={modalTitle}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={submitting}
            onClick={handleSubmit}
          >
            {modalMode === 'add' ? 'Add' : 'Save'}
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: 'Please enter full name' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Full Name" />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>
          
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select a role' }]}
          >            <Select placeholder="Select role">
              <Option value="admin">Admin</Option>
              <Option value="employee">Employee</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="department"
            label="Department"
            rules={[{ required: true, message: 'Please enter department' }]}
          >
            <Input prefix={<TeamOutlined />} placeholder="Department" />
          </Form.Item>
          
          <Form.Item
            name="phone"
            label="Phone Number"
          >
            <Input prefix={<PhoneOutlined />} placeholder="Phone Number" />
          </Form.Item>
          
          {modalMode === 'add' && (
            <Divider>
              <Text type="secondary">Default password will be: staff123</Text>
            </Divider>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default StaffPage;
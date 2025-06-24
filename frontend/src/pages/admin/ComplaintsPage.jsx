import React, { useState, useEffect } from 'react';
import { 
  Table, Typography, Tag, Space, Button, Input, Select,
  DatePicker, Card, Badge, Tooltip, Modal, Form, Dropdown,
  Menu, Avatar, notification
} from 'antd';
import { 
  SearchOutlined, FilterOutlined, EyeOutlined,
  UserOutlined, DownOutlined, EditOutlined,
  DeleteOutlined, ExclamationCircleOutlined,
  SortAscendingOutlined, UserSwitchOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { complaintService } from '../../services/complaintService';
import styled from 'styled-components';
import moment from 'moment';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { confirm } = Modal;

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

const TableFilters = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const StatusTag = styled(Tag)`
  font-size: 12px;
  font-weight: 500;
  padding: 2px 8px;
`;

const ComplaintsPage = () => {
  const { complaints, categories, statuses, staffMembers, updateComplaint, deleteComplaint, loading } = useApp();
  
  // States for filtering and sorting
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [assigneeFilter, setAssigneeFilter] = useState(null);
  const [priorityFilter, setPriorityFilter] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [filteredData, setFilteredData] = useState(complaints);
  
  // State for assignment modal
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [currentComplaint, setCurrentComplaint] = useState(null);
  const [assignForm] = Form.useForm();
  const [assigning, setAssigning] = useState(false);
  
  // State for status update modal
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [statusForm] = Form.useForm();
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  // Apply filters
  useEffect(() => {
    let result = [...complaints];
    
    if (searchText) {
      result = result.filter(complaint => 
        complaint.subject.toLowerCase().includes(searchText.toLowerCase()) ||
        complaint.description.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    if (statusFilter) {
      result = result.filter(complaint => complaint.status === statusFilter);
    }
    
    if (categoryFilter) {
      result = result.filter(complaint => complaint.categoryId === categoryFilter);
    }
    
    if (assigneeFilter) {
      if (assigneeFilter === 'unassigned') {
        result = result.filter(complaint => !complaint.assignedTo);
      } else {
        result = result.filter(complaint => complaint.assignedTo === assigneeFilter);
      }
    }
    
    if (priorityFilter) {
      result = result.filter(complaint => complaint.priority === priorityFilter);
    }
    
    if (dateRange) {
      result = result.filter(complaint => {
        const complaintDate = moment(complaint.createdAt);
        return complaintDate.isAfter(dateRange[0]) && complaintDate.isBefore(dateRange[1]);
      });
    }
    
    // Sort by created date (newest first)
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    setFilteredData(result);
  }, [complaints, searchText, statusFilter, categoryFilter, assigneeFilter, priorityFilter, dateRange]);
  
  // Helper function to get status name and color
  const getStatusInfo = (statusId) => {
    const status = statuses.find(s => s.id === statusId);
    return status ? { name: status.name, color: status.color } : { name: 'Unknown', color: '#999' };
  };

  // Helper function to get category name
  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown';
  };
  
  // Helper function to get staff name
  const getStaffName = (staffId) => {
    const staff = staffMembers.find(s => s.id === staffId);
    return staff ? staff.name : 'Unassigned';
  };
  
  // Open assign modal
  const showAssignModal = (complaint) => {
    setCurrentComplaint(complaint);
    assignForm.setFieldsValue({
      assignedTo: complaint.assignedTo || undefined
    });
    setAssignModalVisible(true);
  };
  
  // Handle assign staff
  const handleAssignStaff = async () => {
    try {
      const values = await assignForm.validateFields();
      setAssigning(true);
      
      await updateComplaint(currentComplaint.id, {
        assignedTo: values.assignedTo
      });
      
      notification.success({
        message: 'Complaint Assigned',
        description: `Complaint has been assigned to ${getStaffName(values.assignedTo)}`
      });
      
      setAssignModalVisible(false);
    } catch (error) {
      console.error('Error assigning staff:', error);
      notification.error({
        message: 'Assignment Failed',
        description: error.message || 'Failed to assign complaint'
      });
    } finally {
      setAssigning(false);
    }
  };
  
  // Open status update modal
  const showStatusModal = (complaint) => {
    setCurrentComplaint(complaint);
    statusForm.setFieldsValue({
      status: complaint.status
    });
    setStatusModalVisible(true);
  };
  
  // Handle status update
  const handleStatusUpdate = async () => {
    try {
      const values = await statusForm.validateFields();
      setUpdatingStatus(true);
      
      await updateComplaint(currentComplaint.id, {
        status: values.status
      });
      
      const newStatus = getStatusInfo(values.status);
      
      notification.success({
        message: 'Status Updated',
        description: `Complaint status has been updated to ${newStatus.name}`
      });
      
      setStatusModalVisible(false);
    } catch (error) {
      console.error('Error updating status:', error);
      notification.error({
        message: 'Update Failed',
        description: error.message || 'Failed to update complaint status'
      });
    } finally {
      setUpdatingStatus(false);
    }
  };
  
  // Handle delete complaint
  const showDeleteConfirm = (complaintId) => {
    confirm({
      title: 'Are you sure you want to delete this complaint?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'No',
      async onOk() {
        try {
          await deleteComplaint(complaintId);
          notification.success({
            message: 'Complaint Deleted',
            description: 'Complaint has been deleted successfully'
          });
        } catch (error) {
          notification.error({
            message: 'Delete Failed',
            description: error.message || 'Failed to delete complaint'
          });
        }
      }
    });
  };
  
  // Define action menu for each row
  const getActionMenu = (record) => (
    <Menu>
      <Menu.Item key="edit" icon={<EditOutlined />}>
        <Link to={`/admin/complaints/${record.id}`}>View Details</Link>
      </Menu.Item>
      <Menu.Item 
        key="assign" 
        icon={<UserSwitchOutlined />}
        onClick={() => showAssignModal(record)}
      >
        Assign Staff
      </Menu.Item>
      <Menu.Item 
        key="status" 
        icon={<SortAscendingOutlined />}
        onClick={() => showStatusModal(record)}
      >
        Update Status
      </Menu.Item>
      <Menu.Item 
        key="delete" 
        icon={<DeleteOutlined />} 
        danger
        onClick={() => showDeleteConfirm(record.id)}
      >
        Delete
      </Menu.Item>
    </Menu>
  );
  
  // Define table columns
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: id => <Text code>#{id}</Text>,
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      ellipsis: true,
      render: (text, record) => (
        <Link to={`/admin/complaints/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'categoryId',
      key: 'category',
      render: categoryId => getCategoryName(categoryId),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: statusId => {
        const status = getStatusInfo(statusId);
        return <StatusTag color={status.color}>{status.name}</StatusTag>;
      },
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: priority => {
        const color = priority === 'High' ? '#f5222d' : priority === 'Medium' ? '#faad14' : '#52c41a';
        return <Tag color={color}>{priority}</Tag>;
      },
    },
    {
      title: 'Assigned To',
      dataIndex: 'assignedTo',
      key: 'assignedTo',
      render: assignedTo => {
        if (!assignedTo) {
          return <Tag>Unassigned</Tag>;
        }
        return getStaffName(assignedTo);
      },
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: date => moment(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Link to={`/admin/complaints/${record.id}`}>
            <Button type="primary" size="small" icon={<EyeOutlined />}>
              View
            </Button>
          </Link>
          <Dropdown overlay={getActionMenu(record)} trigger={['click']}>
            <Button size="small" icon={<DownOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];
  
  const resetFilters = () => {
    setSearchText('');
    setStatusFilter(null);
    setCategoryFilter(null);
    setAssigneeFilter(null);
    setPriorityFilter(null);
    setDateRange(null);
  };
  
  return (
    <div>
      <Title level={2}>Manage Complaints</Title>
      
      <StyledCard>
        <TableHeader>
          <Input
            placeholder="Search complaints..."
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            allowClear
          />
          
          <TableFilters>
            <Select
              placeholder="Status"
              style={{ width: 130 }}
              allowClear
              value={statusFilter}
              onChange={setStatusFilter}
            >
              {statuses.map(status => (
                <Option key={status.id} value={status.id}>
                  {status.name}
                </Option>
              ))}
            </Select>
            
            <Select
              placeholder="Category"
              style={{ width: 150 }}
              allowClear
              value={categoryFilter}
              onChange={setCategoryFilter}
            >
              {categories.map(category => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
            
            <Select
              placeholder="Assigned To"
              style={{ width: 150 }}
              allowClear
              value={assigneeFilter}
              onChange={setAssigneeFilter}
            >
              <Option value="unassigned">Unassigned</Option>
              {staffMembers.map(staff => (
                <Option key={staff.id} value={staff.id}>
                  {staff.name}
                </Option>
              ))}
            </Select>
            
            <Select
              placeholder="Priority"
              style={{ width: 120 }}
              allowClear
              value={priorityFilter}
              onChange={setPriorityFilter}
            >
              <Option value="Low">Low</Option>
              <Option value="Medium">Medium</Option>
              <Option value="High">High</Option>
            </Select>
            
            <RangePicker
              style={{ width: 230 }}
              value={dateRange}
              onChange={setDateRange}
            />
            
            <Button 
              onClick={resetFilters}
              icon={<FilterOutlined />}
            >
              Reset
            </Button>
          </TableFilters>
        </TableHeader>
        
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} complaints`,
          }}
          locale={{ emptyText: 'No complaints found' }}
        />
      </StyledCard>
      
      {/* Assign Staff Modal */}
      <Modal
        title="Assign Staff Member"
        visible={assignModalVisible}
        onCancel={() => setAssignModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setAssignModalVisible(false)}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={assigning}
            onClick={handleAssignStaff}
          >
            Assign
          </Button>,
        ]}
      >
        <Form
          form={assignForm}
          layout="vertical"
        >
          <Form.Item
            name="assignedTo"
            label="Select Staff Member"
            rules={[{ required: true, message: 'Please select a staff member' }]}
          >
            <Select placeholder="Select staff member">
              {staffMembers.map(staff => (
                <Option key={staff.id} value={staff.id}>
                  <Space>
                    <Avatar size="small" icon={<UserOutlined />} />
                    {staff.name} - {staff.department || 'No Department'}
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      
      {/* Update Status Modal */}
      <Modal
        title="Update Complaint Status"
        visible={statusModalVisible}
        onCancel={() => setStatusModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setStatusModalVisible(false)}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={updatingStatus}
            onClick={handleStatusUpdate}
          >
            Update
          </Button>,
        ]}
      >
        <Form
          form={statusForm}
          layout="vertical"
        >
          <Form.Item
            name="status"
            label="Select Status"
            rules={[{ required: true, message: 'Please select a status' }]}
          >
            <Select placeholder="Select status">
              {statuses.map(status => (
                <Option key={status.id} value={status.id}>
                  <Tag color={status.color}>{status.name}</Tag>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ComplaintsPage;
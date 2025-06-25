import React, { useState, useEffect } from 'react';
import { 
  CheckCircleOutlined, 
  FlagOutlined, 
  SortDescendingOutlined
} from '@ant-design/icons';
import { 
  Table, Typography, Tag, Button, Input, Select,
  DatePicker, Card, Space, Badge, Tooltip, Row, Col,
  Statistic, Empty, Divider
} from 'antd';
import { 
  SearchOutlined, FilterOutlined, EyeOutlined,
  ClockCircleOutlined, UserOutlined, FileTextOutlined,
  CalendarOutlined, SortAscendingOutlined, ReloadOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import styled from 'styled-components';
import moment from 'moment';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
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

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
`;

const UserInfoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  
  @media (max-width: 576px) {
    flex-direction: column;
    align-items: flex-end;
  }
`;

const StyledStatisticCard = styled(Card)`
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
  transition: all 0.3s;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    transform: translateY(-3px);
  }
  
  .ant-card-body {
    padding: 20px;
  }
  
  .ant-statistic-title {
    font-size: 16px;
    margin-bottom: 12px;
  }
  
  .ant-statistic-content {
    font-size: 28px;
  }
`;

const TimeDisplay = styled(Tag)`
  font-family: 'Courier New', monospace;
  padding: 6px 12px;
  font-size: 14px;
  border-radius: 4px;
  background-color: #f0f2f5;
  border: 1px solid #d9d9d9;
`;

const UserDisplay = styled(Tag)`
  padding: 6px 12px;
  font-size: 14px;
  border-radius: 4px;
  background-color: #722ed1;
  color: white;
`;

const ComplaintHistoryPage = () => {
  const { complaints, categories, statuses, loading } = useApp();
  const { user } = useAuth();
  
  // Current date and time information as specified
  const currentDateTime = "2025-06-25 11:17:01";
  const currentUser = "Anuj-prajapati-SDE";
  
  // States for filtering and sorting
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [priorityFilter, setPriorityFilter] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('descend');
  const [filteredData, setFilteredData] = useState([]);
  
  // Apply filters
  useEffect(() => {
    // Filter complaints for current user first
    const userComplaints = complaints.filter(complaint => complaint.userId === user.id);
    let result = [...userComplaints];
    
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
    
    if (priorityFilter) {
      result = result.filter(complaint => complaint.priority === priorityFilter);
    }
    
    if (dateRange && dateRange[0] && dateRange[1]) {
      result = result.filter(complaint => {
        const complaintDate = moment(complaint.createdAt);
        return complaintDate.isAfter(dateRange[0]) && complaintDate.isBefore(dateRange[1].add(1, 'days'));
      });
    }
    
    // Sort based on the selected field and order
    result.sort((a, b) => {
      if (sortField === 'createdAt' || sortField === 'updatedAt') {
        return sortOrder === 'ascend' 
          ? new Date(a[sortField]) - new Date(b[sortField])
          : new Date(b[sortField]) - new Date(a[sortField]);
      }
      
      // For other fields
      if (a[sortField] < b[sortField]) return sortOrder === 'ascend' ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortOrder === 'ascend' ? 1 : -1;
      return 0;
    });
    
    setFilteredData(result);
  }, [complaints, user.id, searchText, statusFilter, categoryFilter, priorityFilter, dateRange, sortField, sortOrder]);
  
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
  
  // Handle table sorting
  const handleTableChange = (pagination, filters, sorter) => {
    if (sorter.field) {
      setSortField(sorter.field);
      setSortOrder(sorter.order);
    }
  };
  
  // Define table columns
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: id => <Text code>#{id}</Text>,
      sorter: true,
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      ellipsis: true,
      sorter: true,
      sortDirections: ['ascend', 'descend'],
      render: (text, record) => (
        <Link to={`/complaints/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'categoryId',
      key: 'category',
      sorter: true,
      sortDirections: ['ascend', 'descend'],
      render: categoryId => getCategoryName(categoryId),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      sorter: true,
      sortDirections: ['ascend', 'descend'],
      render: statusId => {
        const status = getStatusInfo(statusId);
        return <StatusTag color={status.color}>{status.name}</StatusTag>;
      },
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      sorter: true,
      sortDirections: ['ascend', 'descend'],
      render: priority => {
        const color = 
          priority === 'High' ? '#f5222d' : 
          priority === 'Medium' ? '#faad14' : '#52c41a';
        return <Tag color={color}>{priority}</Tag>;
      },
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: true,
      sortDirections: ['ascend', 'descend'],
      defaultSortOrder: 'descend',
      render: date => moment(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Last Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      sorter: true,
      sortDirections: ['ascend', 'descend'],
      render: date => moment(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Link to={`/complaints/${record.id}`}>
          <Button type="primary" size="small" icon={<EyeOutlined />}>
            View
          </Button>
        </Link>
      ),
    },
  ];
  
  const resetFilters = () => {
    setSearchText('');
    setStatusFilter(null);
    setCategoryFilter(null);
    setPriorityFilter(null);
    setDateRange(null);
    setSortField('createdAt');
    setSortOrder('descend');
  };
  
  // Count complaints by status - move this inside a useMemo to prevent recalculation
  const userComplaints = React.useMemo(() => 
    complaints.filter(complaint => complaint.userId === user.id), 
    [complaints, user.id]
  );
  
  const newCount = userComplaints.filter(c => c.status === '1').length;
  const inProgressCount = userComplaints.filter(c => c.status === '2' || c.status === '3').length;
  const resolvedCount = userComplaints.filter(c => c.status === '4' || c.status === '5').length;
  const highPriorityCount = userComplaints.filter(c => c.priority === 'High').length;
  
  return (
    <div>
      <PageHeader>
        <Title level={2} style={{ margin: 0 }}>My Complaints</Title>
        
        <UserInfoContainer>
          <UserDisplay icon={<UserOutlined />}>
            {currentUser}
          </UserDisplay>
          
          <TimeDisplay icon={<ClockCircleOutlined />}>
            {currentDateTime}
          </TimeDisplay>
        </UserInfoContainer>
      </PageHeader>
      
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <StyledStatisticCard>
            <Statistic 
              title={<Space><FileTextOutlined /> Total Complaints</Space>}
              value={userComplaints.length} 
              valueStyle={{ color: '#1890ff' }}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">
                All your submitted complaints
              </Text>
            </div>
          </StyledStatisticCard>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <StyledStatisticCard>
            <Statistic 
              title={<Space><ClockCircleOutlined /> In Progress</Space>}
              value={inProgressCount} 
              valueStyle={{ color: '#faad14' }}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">
                Complaints being handled
              </Text>
            </div>
          </StyledStatisticCard>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <StyledStatisticCard>
            <Statistic 
              title={<Space><CheckCircleOutlined /> Resolved</Space>}
              value={resolvedCount} 
              valueStyle={{ color: '#52c41a' }}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">
                Successfully resolved complaints
              </Text>
            </div>
          </StyledStatisticCard>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <StyledStatisticCard>
            <Statistic 
              title={<Space><FlagOutlined /> High Priority</Space>}
              value={highPriorityCount} 
              valueStyle={{ color: '#f5222d' }}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">
                Urgent complaints
              </Text>
            </div>
          </StyledStatisticCard>
        </Col>
      </Row>
      
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
                  <Space>
                    <Badge color={status.color} />
                    {status.name}
                  </Space>
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
              placeholder="Priority"
              style={{ width: 120 }}
              allowClear
              value={priorityFilter}
              onChange={setPriorityFilter}
            >
              <Option value="High">
                <Tag color="#f5222d">High</Tag>
              </Option>
              <Option value="Medium">
                <Tag color="#faad14">Medium</Tag>
              </Option>
              <Option value="Low">
                <Tag color="#52c41a">Low</Tag>
              </Option>
            </Select>
            
            <RangePicker
              style={{ width: 240 }}
              value={dateRange}
              onChange={setDateRange}
              placeholder={['Start Date', 'End Date']}
              format="MMM DD, YYYY"
            />
            
            <Tooltip title="Reset Filters">
              <Button 
                onClick={resetFilters}
                icon={<ReloadOutlined />}
              />
            </Tooltip>
          </TableFilters>
        </TableHeader>
        
        <Divider style={{ margin: '16px 0' }} />
        
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Text>
              Showing <Text strong>{filteredData.length}</Text> of <Text strong>{userComplaints.length}</Text> complaints
            </Text>
            
            <Divider type="vertical" />
            
            <Space>
              <Text>Sort by:</Text>
              <Select
                value={sortField}
                style={{ width: 140 }}
                onChange={(value) => {
                  setSortField(value);
                  setSortOrder('descend'); // Default to descending when changing field
                }}
              >
                <Option value="createdAt">Creation Date</Option>
                <Option value="updatedAt">Last Updated</Option>
                <Option value="subject">Subject</Option>
                <Option value="priority">Priority</Option>
              </Select>
              
              <Button
                icon={sortOrder === 'ascend' ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
                onClick={() => setSortOrder(sortOrder === 'ascend' ? 'descend' : 'ascend')}
              />
            </Space>
          </Space>
        </div>
        
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          onChange={handleTableChange}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} complaints`,
          }}
          locale={{ emptyText: 'No complaints found' }}
          rowClassName={record => 
            record.priority === 'High' ? 'high-priority-row' : ''
          }
          scroll={{ x: 'max-content' }}
        />
      </StyledCard>
      
      {userComplaints.length === 0 && !loading && (
        <div style={{ textAlign: 'center', margin: '48px 0' }}>
          <Empty description="You haven't submitted any complaints yet">
            <Button type="primary" size="large">
              <Link to="/new-complaint">Submit a Complaint</Link>
            </Button>
          </Empty>
        </div>
      )}
    </div>
  );
};

export default ComplaintHistoryPage;
import React, { useState } from 'react';
import { 
  Table, Typography, Tag, Button, Input, Select,
  DatePicker, Card
} from 'antd';
import { 
  SearchOutlined, FilterOutlined, EyeOutlined
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

const ComplaintHistoryPage = () => {
  const { complaints, categories, statuses, loading } = useApp();
  const { user } = useAuth();
  
  // Filter complaints for current user
  const userComplaints = complaints.filter(complaint => complaint.userId === user.id);
  
  // States for filtering and sorting
  // States for filtering and sorting
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  // Apply filters
  // Apply filters
  React.useEffect(() => {
    if (!complaints.length) return;
    
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
    
    if (dateRange && dateRange[0] && dateRange[1]) {
      result = result.filter(complaint => {
        const complaintDate = moment(complaint.createdAt);
        return complaintDate.isAfter(dateRange[0]) && complaintDate.isBefore(dateRange[1]);
      });
    }
    
    // Sort by created date (newest first)
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    setFilteredData(result);
  }, [complaints, userComplaints, searchText, statusFilter, categoryFilter, dateRange]);
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
        <Link to={`/complaints/${record.id}`}>{text}</Link>
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
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: date => moment(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Last Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
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
    setDateRange(null);
  };
  
  return (
    <div>
      <Title level={2}>My Complaints</Title>
      
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
    </div>
  );
};

export default ComplaintHistoryPage;
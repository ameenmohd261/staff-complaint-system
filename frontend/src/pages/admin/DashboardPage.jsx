import React, { useState, useEffect } from 'react';
import { 
  Row, Col, Card, Statistic, List, Table, Tag, Button,
  Typography, Divider, Space, Progress, DatePicker, Spin 
} from 'antd';
import { 
  FileTextOutlined, ClockCircleOutlined, CheckCircleOutlined,
  UserOutlined, TeamOutlined, BarChartOutlined, FileAddOutlined,
  EyeOutlined, ExclamationCircleOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { complaintService } from '../../services/complaintService';
import styled from 'styled-components';
import moment from 'moment';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const { Title: AntTitle, Text } = Typography;
const { RangePicker } = DatePicker;

const StyledCard = styled(Card)`
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
  height: 100%;
  
  .ant-card-head {
    background-color: #fafafa;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }
`;

const StatusTag = styled(Tag)`
  font-size: 12px;
  font-weight: 500;
  padding: 2px 8px;
`;

const ChartContainer = styled.div`
  height: 250px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const DashboardPage = () => {
  const { categories, statuses, staffMembers, loading: appLoading } = useApp();
  const [complaints, setComplaints] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(null); // For date range filtering
  const navigate = useNavigate();
    // Fetch dashboard data from the API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all complaints and dashboard stats in parallel
        const [complaintsData, dashboardStats] = await Promise.all([
          complaintService.getAllComplaints(),
          complaintService.getDashboardStats('admin')
        ]);
        
        setComplaints(complaintsData);
        
        // Fetch report data for charts with date filter if provided
        const dateParams = dateFilter ? {
          startDate: dateFilter[0].toISOString(),
          endDate: dateFilter[1].toISOString()
        } : {};
        
        const reportData = await complaintService.getReportData(dateParams);
        setReportData(reportData);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [dateFilter]);
  
  const [dateRange, setDateRange] = useState([
    moment().subtract(30, 'days'), 
    moment()
  ]);
  
  // Filter complaints based on date range
  const filteredComplaints = complaints.filter(complaint => {
    const complaintDate = moment(complaint.createdAt);
    return complaintDate.isAfter(dateRange[0]) && complaintDate.isBefore(dateRange[1]);
  });
  
  // Calculate statistics
  const totalComplaints = filteredComplaints.length;
  const newComplaints = filteredComplaints.filter(c => c.status === '1').length;
  const inProgressComplaints = filteredComplaints.filter(c => c.status === '2').length;
  const resolvedComplaints = filteredComplaints.filter(c => c.status === '4' || c.status === '5').length;
  const highPriorityComplaints = filteredComplaints.filter(c => c.priority === 'High').length;
  
  // Calculate resolution rate
  const resolutionRate = totalComplaints > 0 
    ? Math.round((resolvedComplaints / totalComplaints) * 100) 
    : 0;
  
  // Get recent complaints
  const recentComplaints = [...filteredComplaints]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);
  
  // Get unassigned complaints
  const unassignedComplaints = filteredComplaints.filter(c => !c.assignedTo && c.status !== '4' && c.status !== '5');
  
  // Prepare data for pie chart
  const statusData = {
    labels: statuses.map(s => s.name),
    datasets: [
      {
        data: statuses.map(s => 
          filteredComplaints.filter(c => c.status === s.id).length
        ),
        backgroundColor: statuses.map(s => s.color),
        borderWidth: 1,
      },
    ],
  };
  
  // Prepare data for category bar chart
  const categoryData = {
    labels: categories.map(c => c.name),
    datasets: [
      {
        label: 'Complaints by Category',
        data: categories.map(c => 
          filteredComplaints.filter(complaint => complaint.categoryId === c.id).length
        ),
        backgroundColor: '#1890ff',
      },
    ],
  };
  
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
  
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: '16px' }}>
        <AntTitle level={2} style={{ margin: 0 }}>Admin Dashboard</AntTitle>
        <RangePicker 
          value={dateRange}
          onChange={setDateRange}
          allowClear={false}
        />
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StyledCard>
            <Statistic
              title="Total Complaints"
              value={totalComplaints}
              prefix={<FileTextOutlined />}
            />
          </StyledCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StyledCard>
            <Statistic
              title="New Complaints"
              value={newComplaints}
              prefix={<FileAddOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </StyledCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StyledCard>
            <Statistic
              title="In Progress"
              value={inProgressComplaints}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </StyledCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StyledCard>
            <Statistic
              title="Resolved"
              value={resolvedComplaints}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </StyledCard>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <StyledCard title="Resolution Rate">
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Progress
                type="dashboard"
                percent={resolutionRate}
                strokeColor={{ '0%': '#1890ff', '100%': '#52c41a' }}
              />
              <div style={{ marginTop: 16 }}>
                <Text strong>{resolvedComplaints} out of {totalComplaints} complaints resolved</Text>
              </div>
            </div>
          </StyledCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StyledCard title="Complaints by Status">
            {loading ? (
              <div style={{ height: 250, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Spin />
              </div>
            ) : (
              <ChartContainer>
                <Pie data={statusData} options={{ maintainAspectRatio: false }} />
              </ChartContainer>
            )}
          </StyledCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StyledCard title="High Priority Complaints">
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: 250 }}>
              <Statistic
                value={highPriorityComplaints}
                valueStyle={{ color: highPriorityComplaints > 0 ? '#f5222d' : '#52c41a' }}
              />
              <div style={{ marginTop: 16 }}>
                <Text type="secondary">
                  {highPriorityComplaints > 0 ? 
                    'Requires immediate attention' : 
                    'No high priority issues'}
                </Text>
              </div>
              {highPriorityComplaints > 0 && (
                <Button 
                  type="primary" 
                  danger 
                  style={{ marginTop: 16 }}
                  onClick={() => navigate('/admin/complaints')}
                >
                  View Issues
                </Button>
              )}
            </div>
          </StyledCard>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <StyledCard title="Recent Complaints" extra={<Link to="/admin/complaints">View All</Link>}>
            <List
              itemLayout="horizontal"
              dataSource={recentComplaints}
              loading={loading}
              renderItem={item => {
                const status = getStatusInfo(item.status);
                
                return (
                  <List.Item
                    actions={[
                      <Link to={`/admin/complaints/${item.id}`}>
                        <Button type="link" icon={<EyeOutlined />}>View</Button>
                      </Link>
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <Link to={`/admin/complaints/${item.id}`}>{item.subject}</Link>
                          <StatusTag color={status.color}>{status.name}</StatusTag>
                        </Space>
                      }
                      description={
                        <>
                          <Text type="secondary">
                            Category: {getCategoryName(item.categoryId)}
                          </Text>
                          <br />
                          <Text type="secondary">
                            Submitted: {moment(item.createdAt).format('MMM DD, YYYY')}
                          </Text>
                        </>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          </StyledCard>
        </Col>
        <Col xs={24} lg={12}>
          <StyledCard 
            title={
              <Space>
                <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                Unassigned Complaints
              </Space>
            }
          >
            <List
              itemLayout="horizontal"
              dataSource={unassignedComplaints.slice(0, 5)}
              loading={loading}
              locale={{ emptyText: 'No unassigned complaints' }}
              renderItem={item => {
                const status = getStatusInfo(item.status);
                
                return (
                  <List.Item
                    actions={[
                      <Link to={`/admin/complaints/${item.id}`}>
                        <Button type="primary" size="small">Assign</Button>
                      </Link>
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <Link to={`/admin/complaints/${item.id}`}>{item.subject}</Link>
                          <StatusTag color={status.color}>{status.name}</StatusTag>
                        </Space>
                      }
                      description={
                        <>
                          <Text type="secondary">
                            Priority: {item.priority}
                          </Text>
                          <br />
                          <Text type="secondary">
                            Submitted: {moment(item.createdAt).format('MMM DD, YYYY')}
                          </Text>
                        </>
                      }
                    />
                  </List.Item>
                );
              }}
            />
            {unassignedComplaints.length > 5 && (
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Button type="link" onClick={() => navigate('/admin/complaints')}>
                  View all {unassignedComplaints.length} unassigned complaints
                </Button>
              </div>
            )}
          </StyledCard>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <StyledCard title="Complaints by Category">
            {loading ? (
              <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Spin />
              </div>
            ) : (
              <div style={{ height: 300 }}>
                <Bar 
                  data={categoryData} 
                  options={{ 
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          precision: 0
                        }
                      }
                    }
                  }} 
                />
              </div>
            )}
          </StyledCard>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
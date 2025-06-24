import React, { useState } from 'react';
import { 
  Card, Typography, Space, Button, DatePicker, 
  Tabs, Divider, Table, Tag, Select, Statistic, Row, Col, 
  Menu
} from 'antd';
import { 
  BarChartOutlined, PieChartOutlined, DownloadOutlined,
  FileExcelOutlined, FilePdfOutlined, CalendarOutlined,
  LineChartOutlined, TeamOutlined
} from '@ant-design/icons';
import { useApp } from '../../contexts/AppContext';
import styled from 'styled-components';
import moment from 'moment';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title,
  PointElement,
  LineElement
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import Dropdown from 'antd/es/dropdown/dropdown';

ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title,
  PointElement,
  LineElement
);

const { Title: AntTitle, Text } = Typography;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Option } = Select;

const StyledCard = styled(Card)`
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
  margin-bottom: 16px;
`;

const ChartContainer = styled.div`
  height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
`;

const StatusTag = styled(Tag)`
  font-size: 12px;
  font-weight: 500;
  padding: 2px 8px;
`;

const ReportHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const ReportsPage = () => {
  const { complaints, categories, statuses, staffMembers, loading } = useApp();
  
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
  const pendingComplaints = filteredComplaints.filter(c => c.status === '3').length;
  const reopenedComplaints = filteredComplaints.filter(c => c.status === '6').length;
  
  // Calculate resolution rate
  const resolutionRate = totalComplaints > 0 
    ? Math.round((resolvedComplaints / totalComplaints) * 100) 
    : 0;
  
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
  
  // Prepare data for status pie chart
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
  
  // Prepare data for timeline chart
  const getTimelineData = () => {
    const days = [];
    const counts = [];
    
    // Create an array of dates between start and end
    let currentDate = dateRange[0].clone();
    while (currentDate.isSameOrBefore(dateRange[1])) {
      days.push(currentDate.format('MMM DD'));
      
      // Count complaints created on this date
      const count = filteredComplaints.filter(c => 
        moment(c.createdAt).format('YYYY-MM-DD') === currentDate.format('YYYY-MM-DD')
      ).length;
      
      counts.push(count);
      
      currentDate = currentDate.clone().add(1, 'day');
    }
    
    return {
      labels: days,
      datasets: [
        {
          label: 'Complaints',
          data: counts,
          borderColor: '#1890ff',
          backgroundColor: 'rgba(24, 144, 255, 0.2)',
          tension: 0.4,
          fill: true,
        },
      ],
    };
  };
  
  // Prepare data for staff performance
  const staffPerformanceData = staffMembers
    .filter(staff => staff.role === 'staff')
    .map(staff => {
      const assignedComplaints = filteredComplaints.filter(c => c.assignedTo === staff.id);
      const resolvedComplaints = assignedComplaints.filter(c => c.status === '4' || c.status === '5');
      
      return {
        id: staff.id,
        name: staff.name,
        assigned: assignedComplaints.length,
        resolved: resolvedComplaints.length,
        resolutionRate: assignedComplaints.length > 0 
          ? Math.round((resolvedComplaints.length / assignedComplaints.length) * 100) 
          : 0,
        avgResolutionTime: assignedComplaints.length > 0 
          ? Math.round(
              assignedComplaints.reduce((sum, c) => {
                if (c.status === '4' || c.status === '5') {
                  const created = moment(c.createdAt);
                  const updated = moment(c.updatedAt);
                  return sum + updated.diff(created, 'hours');
                }
                return sum;
              }, 0) / 
              (resolvedComplaints.length || 1)
            )
          : 0,
      };
    })
    .sort((a, b) => b.resolved - a.resolved);
  
  // Prepare staff performance chart data
  const staffPerformanceChartData = {
    labels: staffPerformanceData.map(s => s.name),
    datasets: [
      {
        label: 'Assigned',
        data: staffPerformanceData.map(s => s.assigned),
        backgroundColor: '#1890ff',
      },
      {
        label: 'Resolved',
        data: staffPerformanceData.map(s => s.resolved),
        backgroundColor: '#52c41a',
      },
    ],
  };
  
  // Define staff performance table columns
  const staffPerformanceColumns = [
    {
      title: 'Staff Member',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Assigned',
      dataIndex: 'assigned',
      key: 'assigned',
      sorter: (a, b) => a.assigned - b.assigned,
    },
    {
      title: 'Resolved',
      dataIndex: 'resolved',
      key: 'resolved',
      sorter: (a, b) => a.resolved - b.resolved,
    },
    {
      title: 'Resolution Rate',
      dataIndex: 'resolutionRate',
      key: 'resolutionRate',
      sorter: (a, b) => a.resolutionRate - b.resolutionRate,
      render: rate => `${rate}%`,
    },
    {
      title: 'Avg. Resolution Time',
      dataIndex: 'avgResolutionTime',
      key: 'avgResolutionTime',
      sorter: (a, b) => a.avgResolutionTime - b.avgResolutionTime,
      render: time => `${time} hours`,
    },
  ];
  
  // Define summary table columns
  const summaryColumns = [
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'New',
      dataIndex: 'new',
      key: 'new',
    },
    {
      title: 'In Progress',
      dataIndex: 'inProgress',
      key: 'inProgress',
    },
    {
      title: 'Pending',
      dataIndex: 'pending',
      key: 'pending',
    },
    {
      title: 'Resolved',
      dataIndex: 'resolved',
      key: 'resolved',
    },
    {
      title: 'Closed',
      dataIndex: 'closed',
      key: 'closed',
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
    },
  ];
  
  // Prepare summary table data
  const summaryData = categories.map(category => {
    const categoryComplaints = filteredComplaints.filter(c => c.categoryId === category.id);
    
    return {
      key: category.id,
      category: category.name,
      new: categoryComplaints.filter(c => c.status === '1').length,
      inProgress: categoryComplaints.filter(c => c.status === '2').length,
      pending: categoryComplaints.filter(c => c.status === '3').length,
      resolved: categoryComplaints.filter(c => c.status === '4').length,
      closed: categoryComplaints.filter(c => c.status === '5').length,
      total: categoryComplaints.length,
    };
  });
  
  return (
    <div>
      <ReportHeader>
        <AntTitle level={2}>Reports & Analytics</AntTitle>
        
        <Space>
          <RangePicker 
            value={dateRange}
            onChange={setDateRange}
            allowClear={false}
          />
          
          <Dropdown overlay={
            <Menu>
              <Menu.Item key="excel" icon={<FileExcelOutlined />}>
                Export to Excel
              </Menu.Item>
              <Menu.Item key="pdf" icon={<FilePdfOutlined />}>
                Export to PDF
              </Menu.Item>
            </Menu>
          } trigger={['click']}>
            <Button icon={<DownloadOutlined />}>
              Export
            </Button>
          </Dropdown>
        </Space>
      </ReportHeader>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <StyledCard>
            <Statistic
              title="Total Complaints"
              value={totalComplaints}
              valueStyle={{ color: '#1890ff' }}
            />
          </StyledCard>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <StyledCard>
            <Statistic
              title="Resolution Rate"
              value={resolutionRate}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
            />
          </StyledCard>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <StyledCard>
            <Statistic
              title="Avg. Response Time"
              value={36}
              suffix="hours"
              valueStyle={{ color: '#722ed1' }}
            />
          </StyledCard>
        </Col>
      </Row>
      
      <Tabs defaultActiveKey="summary" style={{ marginTop: 24 }}>
        <TabPane 
          tab={
            <span>
              <BarChartOutlined />
              Summary
            </span>
          } 
          key="summary"
        >
          <StyledCard title="Complaints Summary by Category">
            <Table
              columns={summaryColumns}
              dataSource={summaryData}
              pagination={false}
              loading={loading}
              summary={pageData => {
                const totals = {
                  new: 0,
                  inProgress: 0,
                  pending: 0,
                  resolved: 0,
                  closed: 0,
                  total: 0,
                };
                
                pageData.forEach(item => {
                  totals.new += item.new;
                  totals.inProgress += item.inProgress;
                  totals.pending += item.pending;
                  totals.resolved += item.resolved;
                  totals.closed += item.closed;
                  totals.total += item.total;
                });
                
                return (
                  <Table.Summary.Row style={{ fontWeight: 'bold' }}>
                    <Table.Summary.Cell>Total</Table.Summary.Cell>
                    <Table.Summary.Cell>{totals.new}</Table.Summary.Cell>
                    <Table.Summary.Cell>{totals.inProgress}</Table.Summary.Cell>
                    <Table.Summary.Cell>{totals.pending}</Table.Summary.Cell>
                    <Table.Summary.Cell>{totals.resolved}</Table.Summary.Cell>
                    <Table.Summary.Cell>{totals.closed}</Table.Summary.Cell>
                    <Table.Summary.Cell>{totals.total}</Table.Summary.Cell>
                  </Table.Summary.Row>
                );
              }}
            />
          </StyledCard>
          
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} md={12}>
              <StyledCard title="Complaints by Status">
                <ChartContainer style={{ height: 300 }}>
                  <Pie data={statusData} options={{ maintainAspectRatio: false }} />
                </ChartContainer>
              </StyledCard>
            </Col>
            <Col xs={24} md={12}>
              <StyledCard title="Complaints by Category">
                <ChartContainer style={{ height: 300 }}>
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
                </ChartContainer>
              </StyledCard>
            </Col>
          </Row>
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <LineChartOutlined />
              Trends
            </span>
          } 
          key="trends"
        >
          <StyledCard title="Complaints Trend">
            <ChartContainer>
              <Line 
                data={getTimelineData()} 
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
            </ChartContainer>
          </StyledCard>
          
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col span={24}>
              <StyledCard title="Monthly Comparison">
                <ChartContainer style={{ height: 300 }}>
                  <Bar 
                    data={{
                      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                      datasets: [
                        {
                          label: 'This Year',
                          data: [65, 59, 80, 81, 56, 55],
                          backgroundColor: '#1890ff',
                        },
                        {
                          label: 'Last Year',
                          data: [28, 48, 40, 19, 86, 27],
                          backgroundColor: '#faad14',
                        },
                      ],
                    }}
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
                </ChartContainer>
              </StyledCard>
            </Col>
          </Row>
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <TeamOutlined />
              Staff Performance
            </span>
          } 
          key="performance"
        >
          <StyledCard title="Staff Resolution Rate">
            <ChartContainer style={{ height: 300 }}>
              <Bar 
                data={staffPerformanceChartData} 
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
            </ChartContainer>
          </StyledCard>
          
          <StyledCard title="Staff Performance Metrics" style={{ marginTop: 16 }}>
            <Table
              columns={staffPerformanceColumns}
              dataSource={staffPerformanceData}
              rowKey="id"
              pagination={false}
              loading={loading}
            />
          </StyledCard>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ReportsPage;
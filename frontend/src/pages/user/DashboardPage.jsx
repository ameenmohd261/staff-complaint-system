import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, List, Tag, Button, Typography, Divider, Space, Spin } from 'antd';
import { FileTextOutlined, ClockCircleOutlined, CheckCircleOutlined, FileAddOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { complaintService } from '../../services/complaintService';
import styled from 'styled-components';
import moment from 'moment';

const { Title, Text } = Typography;

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

const DashboardPage = () => {
  const { categories, statuses } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userComplaints, setUserComplaints] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalComplaints: 0,
    activeComplaints: 0,
    resolvedComplaints: 0
  });
  
  // Fetch user dashboard data from API
  useEffect(() => {
    const fetchUserDashboard = async () => {
      try {
        setLoading(true);
        
        // Fetch user complaints and dashboard stats in parallel
        const [userComplaintsData, stats] = await Promise.all([
          complaintService.getUserComplaints(user.id),
          complaintService.getDashboardStats('user', user.id)
        ]);
        
        setUserComplaints(userComplaintsData);
        setDashboardStats({
          totalComplaints: stats.totalComplaints || 0,
          activeComplaints: stats.activeComplaints || 0,
          resolvedComplaints: stats.resolvedComplaints || 0
        });
      } catch (error) {
        console.error('Error fetching user dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user && user.id) {
      fetchUserDashboard();
    }
  }, [user]);
  
  // Use stats from API or calculate if not available
  const totalComplaints = dashboardStats.totalComplaints || userComplaints.length;
  const activeComplaints = dashboardStats.activeComplaints || userComplaints.filter(
    complaint => complaint.status !== '4' && complaint.status !== '5'
  ).length;
  const resolvedComplaints = dashboardStats.resolvedComplaints || userComplaints.filter(
    complaint => complaint.status === '4' || complaint.status === '5'
  ).length;
  
  // Sort complaints by date (newest first)
  const recentComplaints = [...userComplaints]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>User Dashboard</Title>
        <Button 
          type="primary" 
          icon={<FileAddOutlined />}
          onClick={() => navigate('/new-complaint')}
        >
          Submit New Complaint
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <StyledCard>
            <Statistic
              title="Total Complaints"
              value={totalComplaints}
              prefix={<FileTextOutlined />}
            />
          </StyledCard>
        </Col>
        <Col xs={24} sm={8}>
          <StyledCard>
            <Statistic
              title="Active Complaints"
              value={activeComplaints}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </StyledCard>
        </Col>
        <Col xs={24} sm={8}>
          <StyledCard>
            <Statistic
              title="Resolved Complaints"
              value={resolvedComplaints}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </StyledCard>
        </Col>
      </Row>

      <Divider />

      <StyledCard
        title="Recent Complaints"
        extra={<Link to="/complaints">View All</Link>}
        style={{ marginTop: 24 }}
      >
        <List
          itemLayout="horizontal"
          dataSource={recentComplaints}
          loading={loading}
          locale={{ emptyText: 'No complaints submitted yet' }}
          renderItem={item => {
            const status = getStatusInfo(item.status);
            
            return (
              <List.Item
                actions={[
                  <Link to={`/complaints/${item.id}`}>View Details</Link>
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Link to={`/complaints/${item.id}`}>{item.subject}</Link>
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
    </div>
  );
};

export default DashboardPage;
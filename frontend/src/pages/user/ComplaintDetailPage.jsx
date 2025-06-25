import React, { useState, useEffect } from 'react';
import { 
  Card, Typography, Descriptions, Tag, Timeline, Divider, 
  Button, Input, List, Avatar, Space, Upload, Rate, Empty,
  Spin, Result, Badge, message
} from 'antd';
import { 
  UploadOutlined, SendOutlined, FileTextOutlined,
  UserOutlined, ClockCircleOutlined, FileDoneOutlined,
  ArrowLeftOutlined, PaperClipOutlined, MessageOutlined
} from '@ant-design/icons';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { complaintService } from '../../services/complaintService';
import { userService } from '../../services/userService';
import styled from 'styled-components';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const StyledCard = styled(Card)`
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
  margin-bottom: 16px;
`;

const StatusTag = styled(Tag)`
  font-size: 12px;
  font-weight: 500;
  padding: 2px 8px;
`;

const StatusTimelineItem = styled(Timeline.Item)`
  .ant-timeline-item-head {
    background-color: ${props => props.color || '#1890ff'};
  }
`;

const ComplaintDetailPage = () => {
  const { id } = useParams();
  const { complaints, categories, statuses, loading: appLoading } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [complaint, setComplaint] = useState(null);
  const [comments, setComments] = useState([]);
  const [statusHistory, setStatusHistory] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [userData, setUserData] = useState({});
  const [satisfaction, setSatisfaction] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
    useEffect(() => {
    const fetchData = async () => {
      try {
        // Get complaint details directly from API
        const complaintData = await complaintService.getComplaintById(id);
        
        if (!complaintData) {
          setLoading(false);
          return;
        }
        
        setComplaint(complaintData);
        
        // Get comments, status history, and user data
        const [commentsData, historyData] = await Promise.all([
          complaintService.getComments(id),
          complaintService.getStatusHistory(id)
        ]);
        
        setComments(commentsData);
        setStatusHistory(historyData);
        setSatisfaction(complaintData.satisfaction || 0);
          // Users should now be included in the API responses
        // But let's fetch any that might be missing
        const userIds = new Set();
        const usersData = {};
        
        // Add users from comments
        commentsData.forEach(c => {
          if (c.user) {
            usersData[c.user._id] = c.user;
          } else if (c.userId) {
            userIds.add(c.userId);
          }
        });
        
        // Add users from history
        historyData.forEach(h => {
          if (h.user) {
            usersData[h.user._id] = h.user;
          } else if (h.updatedBy) {
            userIds.add(h.updatedBy);
          }
        });
        
        // Add assigned user
        if (complaintData.assignedTo && typeof complaintData.assignedTo === 'string') {
          userIds.add(complaintData.assignedTo);
        } else if (complaintData.assignedUser) {
          usersData[complaintData.assignedUser._id] = complaintData.assignedUser;
        }
        
        // Fetch any missing users
        for (const userId of userIds) {
          if (!usersData[userId]) {
            try {
              const userData = await userService.getUserById(userId);
              if (userData) {
                usersData[userId] = userData;
              }
            } catch (error) {
              console.error(`Failed to fetch user ${userId}:`, error);
            }
          }
        }
        
        setUserData(usersData);
      } catch (error) {
        console.error('Error fetching complaint details:', error);
        message.error('Failed to load complaint details');
      } finally {
        setLoading(false);
      }
    };
    
    if (!appLoading) {
      fetchData();
    }
  }, [id, complaints, appLoading]);
  
  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    
    setSubmitting(true);
    try {
      const newComment = await complaintService.addComment(id, commentText);
      setComments([...comments, newComment]);
      setCommentText('');
      message.success('Comment added successfully');
    } catch (error) {
      message.error('Failed to add comment: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleSatisfactionRate = async (value) => {
    try {
      const updatedComplaint = await complaintService.updateComplaint(id, { satisfaction: value });
      setComplaint(updatedComplaint);
      setSatisfaction(value);
      message.success('Thank you for your feedback!');
    } catch (error) {
      message.error('Failed to submit rating: ' + error.message);
    }
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
  
  if (loading || appLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '20px' }}>Loading complaint details...</div>
      </div>
    );
  }
  
  if (!complaint) {
    return (
      <Result
        status="404"
        title="Complaint Not Found"
        subTitle="Sorry, the complaint you are looking for does not exist."
        extra={
          <Button type="primary" onClick={() => navigate('/complaints')}>
            Back to My Complaints
          </Button>
        }
      />
    );
  }
  
  const status = getStatusInfo(complaint.status);
  const isResolved = complaint.status === '4' || complaint.status === '5';
  
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/complaints')}>
          Back to My Complaints
        </Button>
      </div>
      
      <StyledCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <Title level={3} style={{ marginBottom: 8 }}>
              {complaint.subject}
            </Title>
            <Space>
              <StatusTag color={status.color}>{status.name}</StatusTag>
              <Badge count={complaint.priority} style={{ backgroundColor: complaint.priority === 'High' ? '#f5222d' : complaint.priority === 'Medium' ? '#faad14' : '#52c41a' }} />
              <Text type="secondary">ID: #{complaint.id}</Text>
            </Space>
          </div>
          
          {isResolved && (
            <div>
              <Text>Your satisfaction:</Text>
              <Rate 
                value={satisfaction} 
                onChange={handleSatisfactionRate}
                disabled={satisfaction > 0}
              />
            </div>
          )}
        </div>
        
        <Divider />
        
        <Descriptions layout="vertical" bordered column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="Category">
            {getCategoryName(complaint.categoryId)}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <StatusTag color={status.color}>{status.name}</StatusTag>
          </Descriptions.Item>
          <Descriptions.Item label="Priority">
            {complaint.priority}
          </Descriptions.Item>
          <Descriptions.Item label="Submitted On">
            {moment(complaint.createdAt).format('MMMM DD, YYYY [at] HH:mm')}
          </Descriptions.Item>
          <Descriptions.Item label="Last Updated">
            {moment(complaint.updatedAt).format('MMMM DD, YYYY [at] HH:mm')}
          </Descriptions.Item>
          <Descriptions.Item label="Assigned To">
            {complaint.assignedTo ? 
              (userData[complaint.assignedTo]?.name || 'Loading...') : 
              'Not assigned yet'}
          </Descriptions.Item>
        </Descriptions>
        
        <Divider orientation="left">Description</Divider>
        <Paragraph style={{ whiteSpace: 'pre-line' }}>
          {complaint.description}
        </Paragraph>
        
        {complaint.attachments && complaint.attachments.length > 0 && (
          <>
            <Divider orientation="left">
              <Space>
                <PaperClipOutlined />
                Attachments ({complaint.attachments.length})
              </Space>
            </Divider>
            <List
              grid={{ gutter: 16, column: 4 }}
              dataSource={complaint.attachments}
              renderItem={attachment => (
                <List.Item>
                  <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                    {attachment.name}
                  </a>
                </List.Item>
              )}
            />
          </>
        )}
      </StyledCard>
      
      <StyledCard title={<Space><ClockCircleOutlined /> Status Timeline</Space>}>
        {statusHistory.length > 0 ? (
          <Timeline mode="left">
            {statusHistory.map(item => {
              const statusInfo = getStatusInfo(item.status);
              const updatedBy = userData[item.updatedBy]?.name || 'Unknown User';
              
              return (
                <StatusTimelineItem 
                  key={item.id} 
                  color={statusInfo.color}
                  label={moment(item.timestamp).format('MMM DD, YYYY HH:mm')}
                >
                  <Text strong>{statusInfo.name}</Text>
                  <div>
                    <Text type="secondary">Updated by {updatedBy}</Text>
                  </div>
                </StatusTimelineItem>
              );
            })}
          </Timeline>
        ) : (
          <Empty description="No status updates yet" />
        )}
      </StyledCard>
      
      <StyledCard title={<Space><MessageOutlined /> Comments</Space>}>
        <List
          itemLayout="horizontal"
          dataSource={comments}
          locale={{ emptyText: 'No comments yet' }}
          renderItem={item => {
            const commenterName = userData[item.userId]?.name || 'Unknown User';
            const isCurrentUser = item.userId === user.id;
            
            return (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} style={{ backgroundColor: isCurrentUser ? '#1890ff' : '#d9d9d9' }} />}
                  title={
                    <Space>
                      <Text strong>{commenterName}</Text>
                      <Text type="secondary">
                        {moment(item.timestamp).format('MMM DD, YYYY HH:mm')}
                      </Text>
                      {isCurrentUser && <Tag color="blue">You</Tag>}
                    </Space>
                  }
                  description={<div style={{ whiteSpace: 'pre-line' }}>{item.comment}</div>}
                />
              </List.Item>
            );
          }}
        />
        
        <Divider />
        
        <div>
          <TextArea
            rows={4}
            placeholder="Add a comment..."
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            maxLength={500}
            showCount
          />
          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleAddComment}
              loading={submitting}
              disabled={!commentText.trim()}
            >
              Add Comment
            </Button>
          </div>
        </div>
      </StyledCard>
    </div>
  );
};

export default ComplaintDetailPage;
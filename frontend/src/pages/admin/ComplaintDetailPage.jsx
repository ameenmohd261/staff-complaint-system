import React, { useState, useEffect } from 'react';
import { 
  Card, Typography, Descriptions, Tag, Timeline, Divider, 
  Button, Input, List, Avatar, Space, Upload, Rate, Empty,
  Spin, Result, Badge, message, Row, Col, Drawer, Form,
  Select, Popconfirm, Steps, Tooltip, Statistic, Alert
} from 'antd';
import { Comment } from '@ant-design/compatible';
import { 
  UploadOutlined, SendOutlined, FileTextOutlined,
  UserOutlined, ClockCircleOutlined, FileDoneOutlined,
  ArrowLeftOutlined, PaperClipOutlined, MessageOutlined,
  EditOutlined, UserSwitchOutlined, CheckCircleOutlined,
  DeleteOutlined, MailOutlined, PhoneOutlined, SolutionOutlined,
  PushpinOutlined, CalendarOutlined, HistoryOutlined,
  ExclamationCircleOutlined, PrinterOutlined, InfoCircleOutlined,
  FileZipOutlined, DownloadOutlined, LinkOutlined,
  BellOutlined, FlagOutlined
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
const { Option } = Select;
const { Step } = Steps;

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

const PriorityFlag = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
  color: white;
  background-color: ${props => 
    props.priority === 'High' ? '#f5222d' : 
    props.priority === 'Medium' ? '#faad14' : '#52c41a'
  };
`;

const ActionButton = styled(Button)`
  margin-right: 8px;
  margin-bottom: 8px;
`;

const AdminNote = styled.div`
  background-color: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 16px;
  
  .ant-typography {
    margin-bottom: 0;
  }
`;

const AdminComplaintDetailPage = () => {
  const { id } = useParams();
  const { complaints, categories, statuses, staffMembers, loading: appLoading, updateComplaint } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [complaint, setComplaint] = useState(null);
  const [comments, setComments] = useState([]);
  const [statusHistory, setStatusHistory] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Drawer states
  const [assignDrawerVisible, setAssignDrawerVisible] = useState(false);
  const [statusDrawerVisible, setStatusDrawerVisible] = useState(false);
  const [editDrawerVisible, setEditDrawerVisible] = useState(false);
  const [addNoteDrawerVisible, setAddNoteDrawerVisible] = useState(false);
  
  // Form instances
  const [assignForm] = Form.useForm();
  const [statusForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [noteForm] = Form.useForm();
  
  // Current date and time
  const currentDateTime = moment.utc('2025-06-25 10:40:40').format('YYYY-MM-DD HH:mm:ss');
  const currentUser = 'Anuj-prajapati-SDE';

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get complaint details
        const complaintData = complaints.find(c => c.id === id);
        
        if (!complaintData) {
          setLoading(false);
          return;
        }
        
        setComplaint(complaintData);
        
        // Pre-populate edit form
        editForm.setFieldsValue({
          subject: complaintData.subject,
          categoryId: complaintData.categoryId,
          description: complaintData.description,
          priority: complaintData.priority || 'Medium'
        });
        
        // Get comments, status history, and user data
        const [commentsData, historyData] = await Promise.all([
          complaintService.getComments(id),
          complaintService.getStatusHistory(id)
        ]);
        
        setComments(commentsData);
        setStatusHistory(historyData);
        
        // Get user data for comments and status updates
        const userIds = new Set();
        userIds.add(complaintData.userId);
        commentsData.forEach(c => userIds.add(c.userId));
        historyData.forEach(h => userIds.add(h.updatedBy));
        
        if (complaintData.assignedTo) {
          userIds.add(complaintData.assignedTo);
        }
        
        const usersData = {};
        for (const userId of userIds) {
          const userData = await userService.getUserById(userId);
          if (userData) {
            usersData[userId] = userData;
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
  }, [id, complaints, appLoading, editForm]);
  
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
  
  const handleAssignStaff = async () => {
    try {
      const values = await assignForm.validateFields();
      setSubmitting(true);
      
      await updateComplaint(id, {
        assignedTo: values.assignedTo
      });
      
      // Update local complaint data
      setComplaint({
        ...complaint,
        assignedTo: values.assignedTo
      });
      
      message.success('Complaint assigned successfully');
      setAssignDrawerVisible(false);
    } catch (error) {
      message.error('Failed to assign staff: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleUpdateStatus = async () => {
    try {
      const values = await statusForm.validateFields();
      setSubmitting(true);
      
      await updateComplaint(id, {
        status: values.status,
        internalNote: values.internalNote
      });
      
      // Get updated complaint and refresh data
      const updatedComplaint = complaints.find(c => c.id === id);
      setComplaint(updatedComplaint);
      
      // Refresh status history
      const historyData = await complaintService.getStatusHistory(id);
      setStatusHistory(historyData);
      
      message.success('Status updated successfully');
      setStatusDrawerVisible(false);
    } catch (error) {
      message.error('Failed to update status: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleEditComplaint = async () => {
    try {
      const values = await editForm.validateFields();
      setSubmitting(true);
      
      await updateComplaint(id, values);
      
      // Get updated complaint
      const updatedComplaint = complaints.find(c => c.id === id);
      setComplaint(updatedComplaint);
      
      message.success('Complaint updated successfully');
      setEditDrawerVisible(false);
    } catch (error) {
      message.error('Failed to update complaint: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleAddNote = async () => {
    try {
      const values = await noteForm.validateFields();
      setSubmitting(true);
      
      // Add a new comment that's marked as internal note
      const noteComment = await complaintService.addComment(id, `[ADMIN NOTE] ${values.note}`);
      setComments([...comments, noteComment]);
      
      message.success('Admin note added successfully');
      setAddNoteDrawerVisible(false);
      noteForm.resetFields();
    } catch (error) {
      message.error('Failed to add note: ' + error.message);
    } finally {
      setSubmitting(false);
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
  
  // Helper function to get the current step in the progress
  const getCurrentStep = (statusId) => {
    const stepMap = {
      '1': 0, // New
      '2': 1, // In Progress
      '3': 1, // Pending Customer
      '4': 2, // Resolved
      '5': 3, // Closed
      '6': 1  // Reopened
    };
    
    return stepMap[statusId] || 0;
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
          <Button type="primary" onClick={() => navigate('/admin/complaints')}>
            Back to Complaints
          </Button>
        }
      />
    );
  }
  
  const status = getStatusInfo(complaint.status);
  const isComplaintClosed = complaint.status === '4' || complaint.status === '5';
  const customerInfo = userData[complaint.userId] || {};
  const assignedStaff = complaint.assignedTo ? userData[complaint.assignedTo] : null;
  
  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/complaints')}>
          Back to Complaints
        </Button>
        
        <Space wrap>
          <Text type="secondary">
            Viewing as: <Tag color="#722ed1">{currentUser}</Tag>
          </Text>
          <Text type="secondary">
            {currentDateTime} UTC
          </Text>
        </Space>
      </div>
      
      <StyledCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <Badge.Ribbon text={status.name} color={status.color}>
              <Title level={3} style={{ marginBottom: 8 }}>
                {complaint.subject}
              </Title>
            </Badge.Ribbon>
            
            <Space wrap style={{ marginTop: 16 }}>
              <Text>ID: <Text strong>#{complaint.id}</Text></Text>
              <Divider type="vertical" />
              <Text>Created: <Text strong>{moment(complaint.createdAt).format('MMM DD, YYYY HH:mm')}</Text></Text>
              <Divider type="vertical" />
              <Text>Last Updated: <Text strong>{moment(complaint.updatedAt).format('MMM DD, YYYY HH:mm')}</Text></Text>
            </Space>
          </div>
          
          <PriorityFlag priority={complaint.priority}>
            <FlagOutlined style={{ marginRight: 8 }} />
            {complaint.priority} Priority
          </PriorityFlag>
        </div>
        
        <Steps 
          current={getCurrentStep(complaint.status)} 
          size="small"
          style={{ marginBottom: 24 }}
        >
          <Step title="Submitted" description={moment(complaint.createdAt).format('MMM DD')} />
          <Step title="In Progress" description={
            complaint.status === '2' || complaint.status === '3' || complaint.status === '6' 
              ? moment(
                  statusHistory.find(s => s.status === '2' || s.status === '3' || s.status === '6')?.timestamp
                )?.format('MMM DD') || '-'
              : '-'
          } />
          <Step title="Resolved" description={
            complaint.status === '4' 
              ? moment(
                  statusHistory.find(s => s.status === '4')?.timestamp
                )?.format('MMM DD') || '-'
              : '-'
          } />
          <Step title="Closed" description={
            complaint.status === '5' 
              ? moment(
                  statusHistory.find(s => s.status === '5')?.timestamp
                )?.format('MMM DD') || '-'
              : '-'
          } />
        </Steps>
        
        <Row gutter={24}>
          <Col xs={24} md={16}>
            <StyledCard title={<Space><InfoCircleOutlined /> Complaint Details</Space>} bordered={false}>
              <Descriptions layout="vertical" bordered column={{ xs: 1, sm: 2 }}>
                <Descriptions.Item label="Category" span={2}>
                  {getCategoryName(complaint.categoryId)}
                </Descriptions.Item>
                
                <Descriptions.Item label="Description" span={2}>
                  <div style={{ whiteSpace: 'pre-line' }}>
                    {complaint.description}
                  </div>
                </Descriptions.Item>
                
                <Descriptions.Item label="Status">
                  <StatusTag color={status.color}>{status.name}</StatusTag>
                </Descriptions.Item>
                
                <Descriptions.Item label="Priority">
                  <Tag color={
                    complaint.priority === 'High' ? '#f5222d' : 
                    complaint.priority === 'Medium' ? '#faad14' : '#52c41a'
                  }>
                    {complaint.priority}
                  </Tag>
                </Descriptions.Item>
                
                {complaint.satisfaction > 0 && (
                  <Descriptions.Item label="Customer Satisfaction" span={2}>
                    <Rate disabled value={complaint.satisfaction} />
                  </Descriptions.Item>
                )}
              </Descriptions>
              
              {complaint.attachments && complaint.attachments.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <Title level={5}>
                    <PaperClipOutlined /> Attachments ({complaint.attachments.length})
                  </Title>
                  <List
                    grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
                    dataSource={complaint.attachments}
                    renderItem={attachment => (
                      <List.Item>
                        <Card size="small" hoverable>
                          <Space direction="vertical" style={{ width: '100%' }}>
                            <Text ellipsis>{attachment.name}</Text>
                            <div>
                              <Button 
                                type="link" 
                                size="small" 
                                icon={<DownloadOutlined />}
                                onClick={() => window.open(attachment.url, '_blank')}
                              >
                                Download
                              </Button>
                            </div>
                          </Space>
                        </Card>
                      </List.Item>
                    )}
                  />
                </div>
              )}
            </StyledCard>
          </Col>
          
          <Col xs={24} md={8}>
            <Row gutter={[0, 16]}>
              <Col span={24}>
                <StyledCard title={<Space><UserOutlined /> Customer Information</Space>} bordered={false}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                    <Avatar size={64} icon={<UserOutlined />} />
                    <div style={{ marginLeft: 16 }}>
                      <Text strong style={{ fontSize: 16, display: 'block' }}>{customerInfo.name}</Text>
                      <Text type="secondary">{customerInfo.email}</Text>
                    </div>
                  </div>
                  
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label={<Space><MailOutlined /> Email</Space>}>
                      <a href={`mailto:${customerInfo.email}`}>{customerInfo.email}</a>
                    </Descriptions.Item>
                    
                    <Descriptions.Item label={<Space><PhoneOutlined /> Phone</Space>}>
                      {customerInfo.phone || 'N/A'}
                    </Descriptions.Item>
                    
                    <Descriptions.Item label={<Space><CalendarOutlined /> Joined</Space>}>
                      {moment(customerInfo.createdAt).format('MMM DD, YYYY')}
                    </Descriptions.Item>
                    
                    <Descriptions.Item label={<Space><FileTextOutlined /> Total Complaints</Space>}>
                      {complaints.filter(c => c.userId === complaint.userId).length}
                    </Descriptions.Item>
                  </Descriptions>
                  
                  <div style={{ marginTop: 16 }}>
                    <Button icon={<HistoryOutlined />} block>
                      View Customer History
                    </Button>
                  </div>
                </StyledCard>
              </Col>
              
              <Col span={24}>
                <StyledCard title={<Space><SolutionOutlined /> Assignment</Space>} bordered={false}>
                  {assignedStaff ? (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                        <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                        <div style={{ marginLeft: 16 }}>
                          <Text strong style={{ fontSize: 16, display: 'block' }}>{assignedStaff.name}</Text>
                          <Text type="secondary">{assignedStaff.department || 'No Department'}</Text>
                        </div>
                      </div>
                      
                      <Descriptions column={1} size="small">
                        <Descriptions.Item label={<Space><MailOutlined /> Email</Space>}>
                          <a href={`mailto:${assignedStaff.email}`}>{assignedStaff.email}</a>
                        </Descriptions.Item>
                        
                        {assignedStaff.phone && (
                          <Descriptions.Item label={<Space><PhoneOutlined /> Phone</Space>}>
                            {assignedStaff.phone}
                          </Descriptions.Item>
                        )}
                        
                        <Descriptions.Item label={<Space><ClockCircleOutlined /> Assigned On</Space>}>
                          {moment(
                            statusHistory.find(s => s.status === '2')?.timestamp || complaint.updatedAt
                          ).format('MMM DD, YYYY')}
                        </Descriptions.Item>
                      </Descriptions>
                      
                      <div style={{ marginTop: 16 }}>
                        <Button 
                          icon={<UserSwitchOutlined />} 
                          onClick={() => setAssignDrawerVisible(true)}
                          block
                        >
                          Reassign
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                      <div style={{ marginBottom: 16 }}>
                        <Text type="secondary">This complaint is not assigned to any staff member.</Text>
                      </div>
                      <Button 
                        type="primary" 
                        icon={<UserSwitchOutlined />}
                        onClick={() => setAssignDrawerVisible(true)}
                      >
                        Assign Staff
                      </Button>
                    </div>
                  )}
                </StyledCard>
              </Col>
              
              <Col span={24}>
                <StyledCard bordered={false}>
                  <Row gutter={[8, 8]}>
                    <Col span={12}>
                      <Statistic 
                        title="Response Time" 
                        value={24} 
                        suffix="hrs"
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic 
                        title="Resolution Time" 
                        value={customerInfo.satisfaction ? 72 : '-'} 
                        suffix="hrs"
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Col>
                  </Row>
                </StyledCard>
              </Col>
            </Row>
          </Col>
        </Row>
        
        <Divider />
        
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <ActionButton 
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => {
                statusForm.setFieldsValue({ status: '4' });
                setStatusDrawerVisible(true);
              }}
              disabled={isComplaintClosed}
            >
              Resolve
            </ActionButton>
            
            <ActionButton
              icon={<EditOutlined />}
              onClick={() => setEditDrawerVisible(true)}
              disabled={isComplaintClosed}
            >
              Edit
            </ActionButton>
            
            <ActionButton
              icon={<UserSwitchOutlined />}
              onClick={() => setAssignDrawerVisible(true)}
              disabled={isComplaintClosed}
            >
              {assignedStaff ? 'Reassign' : 'Assign'}
            </ActionButton>
            
            <ActionButton
              icon={<ExclamationCircleOutlined />}
              onClick={() => {
                statusForm.setFieldsValue({ status: complaint.status });
                setStatusDrawerVisible(true);
              }}
              disabled={isComplaintClosed}
            >
              Update Status
            </ActionButton>
            
            <ActionButton
              icon={<PushpinOutlined />}
              onClick={() => setAddNoteDrawerVisible(true)}
            >
              Add Note
            </ActionButton>
            
            <ActionButton
              icon={<MailOutlined />}
              onClick={() => message.info('Email functionality will be implemented in the backend')}
            >
              Email Customer
            </ActionButton>
            
            <ActionButton
              icon={<PrinterOutlined />}
              onClick={() => window.print()}
            >
              Print
            </ActionButton>
            
            <ActionButton
              icon={<FileZipOutlined />}
              onClick={() => message.info('Download functionality will be implemented in the backend')}
            >
              Export
            </ActionButton>
            
            <Popconfirm
              title="Are you sure you want to delete this complaint?"
              onConfirm={() => {
                message.success('Complaint deleted successfully');
                navigate('/admin/complaints');
              }}
              okText="Yes"
              cancelText="No"
            >
              <ActionButton danger icon={<DeleteOutlined />}>
                Delete
              </ActionButton>
            </Popconfirm>
          </Space>
        </div>
        
        <Row gutter={24}>
          <Col xs={24} md={12}>
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
          </Col>
          
          <Col xs={24} md={12}>
            <StyledCard title={<Space><MessageOutlined /> Comments & Notes</Space>}>
              {comments.filter(comment => comment.comment.startsWith('[ADMIN NOTE]')).length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <Title level={5}>Admin Notes</Title>
                  {comments
                    .filter(comment => comment.comment.startsWith('[ADMIN NOTE]'))
                    .map(note => {
                      const commenterName = userData[note.userId]?.name || 'Unknown User';
                      
                      return (
                        <AdminNote key={note.id}>
                          <Paragraph>
                            {note.comment.replace('[ADMIN NOTE] ', '')}
                          </Paragraph>
                          <Text type="secondary">
                            By {commenterName} • {moment(note.timestamp).format('MMM DD, YYYY HH:mm')}
                          </Text>
                        </AdminNote>
                      );
                    })
                  }
                  <Divider />
                </div>
              )}
              
              <List
                itemLayout="horizontal"
                dataSource={comments.filter(comment => !comment.comment.startsWith('[ADMIN NOTE]'))}
                locale={{ emptyText: 'No comments yet' }}
                renderItem={item => {
                  const commenterName = userData[item.userId]?.name || 'Unknown User';
                  const isAdmin = userData[item.userId]?.role === 'admin' || userData[item.userId]?.role === 'staff';
                  const isCurrentUser = item.userId === user.id;
                  
                  return (
                    <Comment
                      author={
                        <Space>
                          <Text strong>{commenterName}</Text>
                          {isAdmin && <Tag color="#722ed1">Staff</Tag>}
                          {isCurrentUser && <Tag color="blue">You</Tag>}
                        </Space>
                      }
                      avatar={
                        <Avatar 
                          icon={<UserOutlined />} 
                          style={{ backgroundColor: isAdmin ? '#1890ff' : '#d9d9d9' }} 
                        />
                      }
                      content={
                        <div style={{ whiteSpace: 'pre-line' }}>{item.comment}</div>
                      }
                      datetime={
                        <Tooltip title={moment(item.timestamp).format('YYYY-MM-DD HH:mm:ss')}>
                          <span>{moment(item.timestamp).fromNow()}</span>
                        </Tooltip>
                      }
                    />
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
                  disabled={isComplaintClosed}
                  maxLength={500}
                  showCount
                />
                <div style={{ marginTop: 16, textAlign: 'right' }}>
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleAddComment}
                    loading={submitting}
                    disabled={!commentText.trim() || isComplaintClosed}
                  >
                    Add Comment
                  </Button>
                </div>
              </div>
            </StyledCard>
          </Col>
        </Row>
      </StyledCard>
      
      {/* Assign Staff Drawer */}
      <Drawer
        title="Assign Staff Member"
        width={400}
        onClose={() => setAssignDrawerVisible(false)}
        visible={assignDrawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
        extra={
          <Space>
            <Button onClick={() => setAssignDrawerVisible(false)}>Cancel</Button>
            <Button 
              type="primary" 
              onClick={handleAssignStaff}
              loading={submitting}
            >
              Assign
            </Button>
          </Space>
        }
      >
        <Form
          form={assignForm}
          layout="vertical"
          initialValues={{ assignedTo: complaint.assignedTo }}
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
                    <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                    {staff.name} - {staff.department || 'No Department'}
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            label="Add Note (Optional)"
            name="assignmentNote"
          >
            <TextArea 
              rows={4} 
              placeholder="Add a note about this assignment"
            />
          </Form.Item>
          
          <Form.Item name="sendNotification" valuePropName="checked">
            <Checkbox defaultChecked>Notify staff member via email</Checkbox>
          </Form.Item>
        </Form>
      </Drawer>
      
      {/* Update Status Drawer */}
      <Drawer
        title="Update Complaint Status"
        width={400}
        onClose={() => setStatusDrawerVisible(false)}
        visible={statusDrawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
        extra={
          <Space>
            <Button onClick={() => setStatusDrawerVisible(false)}>Cancel</Button>
            <Button 
              type="primary" 
              onClick={handleUpdateStatus}
              loading={submitting}
            >
              Update
            </Button>
          </Space>
        }
      >
        <Form
          form={statusForm}
          layout="vertical"
          initialValues={{ status: complaint.status }}
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
          
          <Form.Item
            name="internalNote"
            label="Internal Note (Optional)"
          >
            <TextArea 
              rows={4} 
              placeholder="Add an internal note about this status change"
            />
          </Form.Item>
          
          <Form.Item name="notifyCustomer" valuePropName="checked">
            <Checkbox defaultChecked>Notify customer about status change</Checkbox>
          </Form.Item>
        </Form>
      </Drawer>
      
      {/* Edit Complaint Drawer */}
      <Drawer
        title="Edit Complaint"
        width={600}
        onClose={() => setEditDrawerVisible(false)}
        visible={editDrawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
        extra={
          <Space>
            <Button onClick={() => setEditDrawerVisible(false)}>Cancel</Button>
            <Button 
              type="primary" 
              onClick={handleEditComplaint}
              loading={submitting}
            >
              Save Changes
            </Button>
          </Space>
        }
      >
        <Form
          form={editForm}
          layout="vertical"
        >
          <Form.Item
            name="subject"
            label="Subject"
            rules={[
              { required: true, message: 'Please enter the subject' },
              { max: 100, message: 'Subject should not exceed 100 characters' }
            ]}
          >
            <Input placeholder="Complaint subject" />
          </Form.Item>
          
          <Form.Item
            name="categoryId"
            label="Category"
            rules={[{ required: true, message: 'Please select a category' }]}
          >
            <Select placeholder="Select category">
              {categories.map(category => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description"
            rules={[
              { required: true, message: 'Please enter the description' },
              { min: 20, message: 'Description should be at least 20 characters' }
            ]}
          >
            <TextArea 
              rows={6}
              placeholder="Detailed description of the complaint"
              showCount
              maxLength={2000}
            />
          </Form.Item>
          
          <Form.Item
            name="priority"
            label="Priority"
            rules={[{ required: true, message: 'Please select the priority' }]}
          >
            <Select placeholder="Select priority">
              <Option value="Low">Low</Option>
              <Option value="Medium">Medium</Option>
              <Option value="High">High</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            label="Attachments"
          >
            <Upload
              fileList={complaint.attachments?.map((file, index) => ({
                uid: `-${index}`,
                name: file.name,
                status: 'done',
                url: file.url
              })) || []}
              listType="picture"
            >
              <Button icon={<UploadOutlined />}>Add Files</Button>
            </Upload>
            <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
              Supported file types: JPG, PNG, PDF, DOC (Max: 5 files, 5MB each)
            </Text>
          </Form.Item>
          
          <Form.Item name="notifyCustomer" valuePropName="checked">
            <Checkbox>Notify customer about these changes</Checkbox>
          </Form.Item>
        </Form>
      </Drawer>
      
      {/* Add Admin Note Drawer */}
      <Drawer
        title="Add Admin Note"
        width={400}
        onClose={() => setAddNoteDrawerVisible(false)}
        visible={addNoteDrawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
        extra={
          <Space>
            <Button onClick={() => setAddNoteDrawerVisible(false)}>Cancel</Button>
            <Button 
              type="primary" 
              onClick={handleAddNote}
              loading={submitting}
            >
              Add Note
            </Button>
          </Space>
        }
      >
        <Form
          form={noteForm}
          layout="vertical"
        >
          <Form.Item
            name="note"
            label="Admin Note (Only visible to staff)"
            rules={[{ required: true, message: 'Please enter a note' }]}
          >
            <TextArea 
              rows={6}
              placeholder="Enter an internal note about this complaint"
              showCount
              maxLength={500}
            />
          </Form.Item>
          
          <Alert
            message="Internal Notes"
            description="Admin notes are only visible to staff members and not to customers. Use them to add important information or instructions for other staff members."
            type="info"
            showIcon
          />
        </Form>
      </Drawer>
    </div>
  );
};

export default AdminComplaintDetailPage;
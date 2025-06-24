import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getComplaintById, updateComplaint, addComment, clearComplaint } from '../../actions/complaint';
import { getDepartments } from '../../actions/department';
import Spinner from '../layout/Spinner';
import { Container, Card, Button, Row, Col, Badge, Form, ListGroup, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPaperclip, faEdit, faTrash, faClock, faUser, faComment, faCheck } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';

const ComplaintDetail = ({
  getComplaintById,
  updateComplaint,
  addComment,
  clearComplaint,
  getDepartments,
  auth: { user },
  complaint: { complaint, loading },
  department: { departments }
}) => {
  const { id } = useParams();
  
  const [statusData, setStatusData] = useState({
    status: '',
    resolutionNotes: ''
  });
  
  const [commentData, setCommentData] = useState({
    text: ''
  });
  
  const [showStatusForm, setShowStatusForm] = useState(false);
  
  useEffect(() => {
    getComplaintById(id);
    getDepartments();
    
    return () => clearComplaint();
  }, [getComplaintById, getDepartments, clearComplaint, id]);
  
  useEffect(() => {
    if (complaint) {
      setStatusData({
        status: complaint.status || '',
        resolutionNotes: complaint.resolutionNotes || ''
      });
    }
  }, [complaint]);
  
  const { status, resolutionNotes } = statusData;
  const { text } = commentData;
  
  const onStatusChange = e => {
    setStatusData({ ...statusData, [e.target.name]: e.target.value });
  };
  
  const onCommentChange = e => {
    setCommentData({ ...commentData, [e.target.name]: e.target.value });
  };
  
  const onStatusSubmit = async e => {
    e.preventDefault();
    await updateComplaint(id, statusData);
    setShowStatusForm(false);
  };
  
  const onCommentSubmit = async e => {
    e.preventDefault();
    await addComment(id, { text });
    setCommentData({ text: '' });
  };
  
  const getStatusBadge = status => {
    switch(status) {
      case 'pending':
        return <Badge bg="warning" className="py-2 px-3">Pending</Badge>;
      case 'in_progress':
        return <Badge bg="primary" className="py-2 px-3">In Progress</Badge>;
      case 'resolved':
        return <Badge bg="success" className="py-2 px-3">Resolved</Badge>;
      default:
        return <Badge bg="secondary" className="py-2 px-3">Unknown</Badge>;
    }
  };
  
  const getPriorityBadge = priority => {
    switch(priority) {
      case 'high':
        return <Badge bg="danger" className="py-2 px-3">High Priority</Badge>;
      case 'medium':
        return <Badge bg="warning" className="py-2 px-3">Medium Priority</Badge>;
      case 'low':
        return <Badge bg="info" className="py-2 px-3">Low Priority</Badge>;
      default:
        return <Badge bg="secondary" className="py-2 px-3">Medium Priority</Badge>;
    }
  };
  
  const getCategoryName = categoryKey => {
    const categories = {
      'it_support': 'IT Support',
      'hr_issues': 'HR Issues',
      'facility': 'Facility Issues',
      'equipment': 'Equipment Problems',
      'software': 'Software Issues',
      'security': 'Security Concerns',
      'other': 'Other'
    };
    
    return categories[categoryKey] || categoryKey;
  };
  
  const isAdmin = user && (user.role === 'admin' || user.role === 'department_head');
  const isOwner = user && complaint && user._id === complaint.submittedBy._id;
  const canUpdateStatus = isAdmin;
  const canComment = isAdmin || isOwner;
  
  return loading || !complaint ? (
    <Spinner />
  ) : (
    <Container>
      <div className="d-flex align-items-center mb-4">
        <Button 
          as={Link} 
          to={isAdmin ? "/admin/dashboard" : "/dashboard"} 
          variant="link" 
          className="ps-0 text-decoration-none"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          Back to Dashboard
        </Button>
      </div>
      
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-white">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h4 className="mb-0">{complaint.title}</h4>
              <div className="mt-2">
                {getStatusBadge(complaint.status)}
                <span className="mx-2">•</span>
                {getPriorityBadge(complaint.priority)}
              </div>
            </div>
            <div>
              {isAdmin && (
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => setShowStatusForm(!showStatusForm)}
                >
                  <FontAwesomeIcon icon={faEdit} className="me-2" />
                  Update Status
                </Button>
              )}
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          {showStatusForm && (
            <Card className="mb-4 bg-light border-0">
              <Card.Body>
                <h5 className="mb-3">Update Complaint Status</h5>
                <Form onSubmit={onStatusSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Status</Form.Label>
                        <Form.Select
                          name="status"
                          value={status}
                          onChange={onStatusChange}
                          required
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Resolution Notes</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          name="resolutionNotes"
                          value={resolutionNotes}
                          onChange={onStatusChange}
                          placeholder="Add notes about the resolution or status update"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <div className="d-flex justify-content-end">
                    <Button 
                      variant="outline-secondary" 
                      className="me-2"
                      onClick={() => setShowStatusForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      variant="primary"
                    >
                      Update Status
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          )}
          
          <Row>
            <Col md={8}>
              <h5 className="mb-3">Description</h5>
              <p>{complaint.description}</p>
              
              {complaint.attachments && complaint.attachments.length > 0 && (
                <div className="mt-4">
                  <h5 className="mb-3">
                    <FontAwesomeIcon icon={faPaperclip} className="me-2" />
                    Attachments ({complaint.attachments.length})
                  </h5>
                  <div className="d-flex flex-wrap">
                    {complaint.attachments.map((attachment, index) => (
                      <a 
                        key={index}
                        href={attachment.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="me-3 mb-3 text-decoration-none"
                      >
                        <div className="attachment-item p-3 border rounded text-center">
                          <div className="attachment-icon mb-2">
                            {attachment.fileType && attachment.fileType.startsWith('image/') ? (
                              <img 
                                src={attachment.fileUrl} 
                                alt={attachment.fileName} 
                                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                className="img-thumbnail" 
                              />
                            ) : (
                              <FontAwesomeIcon icon={faPaperclip} size="2x" />
                            )}
                          </div>
                          <p className="mb-0 small text-truncate" style={{ maxWidth: '100px' }}>
                            {attachment.fileName}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
              
              {complaint.resolutionNotes && (
                <div className="mt-4">
                  <h5 className="mb-3">Resolution Notes</h5>
                  <Alert variant="success">
                    <p className="mb-0">{complaint.resolutionNotes}</p>
                  </Alert>
                </div>
              )}
            </Col>
            
            <Col md={4}>
              <Card className="bg-light border-0">
                <Card.Body>
                  <h5 className="mb-3">Complaint Details</h5>
                  <ListGroup variant="flush">
                    <ListGroup.Item className="bg-transparent px-0 py-2 d-flex justify-content-between">
                      <strong>Category:</strong>
                      <span>{getCategoryName(complaint.category)}</span>
                    </ListGroup.Item>
                    <ListGroup.Item className="bg-transparent px-0 py-2 d-flex justify-content-between">
                      <strong>Department:</strong>
                      <span>{complaint.department}</span>
                    </ListGroup.Item>
                    <ListGroup.Item className="bg-transparent px-0 py-2 d-flex justify-content-between">
                      <strong>Submitted By:</strong>
                      <span>{complaint.submittedBy.name}</span>
                    </ListGroup.Item>
                    <ListGroup.Item className="bg-transparent px-0 py-2 d-flex justify-content-between">
                      <strong>Submitted On:</strong>
                      <span>{moment(complaint.submittedDate).format('MMM DD, YYYY')}</span>
                    </ListGroup.Item>
                    {complaint.assignedTo && (
                      <ListGroup.Item className="bg-transparent px-0 py-2 d-flex justify-content-between">
                        <strong>Assigned To:</strong>
                        <span>{complaint.assignedTo.name}</span>
                      </ListGroup.Item>
                    )}
                    {complaint.status === 'resolved' && complaint.resolvedDate && (
                      <ListGroup.Item className="bg-transparent px-0 py-2 d-flex justify-content-between">
                        <strong>Resolved On:</strong>
                        <span>{moment(complaint.resolvedDate).format('MMM DD, YYYY')}</span>
                      </ListGroup.Item>
                    )}
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-white">
          <h5 className="mb-0">
            <FontAwesomeIcon icon={faComment} className="me-2" />
            Comments
          </h5>
        </Card.Header>
        <Card.Body>
          {canComment && (
            <Form onSubmit={onCommentSubmit} className="mb-4">
              <Form.Group className="mb-3">
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="text"
                  value={text}
                  onChange={onCommentChange}
                  placeholder="Add a comment..."
                  required
                />
              </Form.Group>
              <div className="d-flex justify-content-end">
                <Button 
                  type="submit" 
                  variant="primary"
                >
                  Submit Comment
                </Button>
              </div>
            </Form>
          )}
          
          {complaint.comments && complaint.comments.length > 0 ? (
            complaint.comments.map((comment, index) => (
              <Card key={index} className="mb-3 border-0 bg-light">
                <Card.Body>
                  <div className="d-flex align-items-start">
                    <div className="comment-avatar me-3 rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                      <FontAwesomeIcon icon={faUser} />
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between">
                        <h6 className="mb-1">{comment.name}</h6>
                        <small className="text-muted">{moment(comment.date).format('MMM DD, YYYY [at] h:mm A')}</small>
                      </div>
                      <p className="mb-0">{comment.text}</p>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ))
          ) : (
            <div className="text-center py-4">
              <FontAwesomeIcon icon={faComment} size="2x" className="text-muted mb-3" />
              <p className="lead mb-0">No comments yet</p>
              <p className="text-muted">Be the first to add a comment.</p>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

ComplaintDetail.propTypes = {
  getComplaintById: PropTypes.func.isRequired,
  updateComplaint: PropTypes.func.isRequired,
  addComment: PropTypes.func.isRequired,
  clearComplaint: PropTypes.func.isRequired,
  getDepartments: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  complaint: PropTypes.object.isRequired,
  department: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  complaint: state.complaint,
  department: state.department
});

export default connect(
  mapStateToProps, 
  { getComplaintById, updateComplaint, addComment, clearComplaint, getDepartments }
)(ComplaintDetail);
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getComplaints } from '../../actions/complaint';
import Spinner from '../layout/Spinner';
import { Container, Row, Col, Card, Button, Table, Badge, Form, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSearch, faFilter, faSortAmountDown } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';

const ComplaintsList = ({
  getComplaints,
  auth: { user },
  complaint: { complaints, loading }
}) => {
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    getComplaints();
  }, [getComplaints]);

  useEffect(() => {
    if (!loading) {
      applyFilters();
    }
  }, [loading, filterStatus, filterCategory, sortBy, searchTerm, complaints]);

  const applyFilters = () => {
    let filtered = [...complaints];
    
    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(c => c.status === filterStatus);
    }
    
    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(c => c.category === filterCategory);
    }
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(term) || 
        c.description.toLowerCase().includes(term)
      );
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.submittedDate) - new Date(b.submittedDate));
        break;
      case 'status':
        filtered.sort((a, b) => {
          const statusOrder = { pending: 1, in_progress: 2, resolved: 3 };
          return statusOrder[a.status] - statusOrder[b.status];
        });
        break;
      case 'priority':
        filtered.sort((a, b) => {
          const priorityOrder = { high: 1, medium: 2, low: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
        break;
      default:
        filtered.sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate));
    }
    
    setFilteredComplaints(filtered);
  };

  const getStatusBadge = status => {
    switch(status) {
      case 'pending':
        return <Badge bg="warning">Pending</Badge>;
      case 'in_progress':
        return <Badge bg="primary">In Progress</Badge>;
      case 'resolved':
        return <Badge bg="success">Resolved</Badge>;
      default:
        return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  const getPriorityBadge = priority => {
    switch(priority) {
      case 'high':
        return <Badge bg="danger">High</Badge>;
      case 'medium':
        return <Badge bg="warning">Medium</Badge>;
      case 'low':
        return <Badge bg="info">Low</Badge>;
      default:
        return <Badge bg="secondary">Medium</Badge>;
    }
  };
  
  const getCategoryName = categoryKey => {
    const categories = {
      'it_support': 'IT Support',
      'hr_issues': 'HR Issues',
      'facility': 'Facility Issues',
      'equipment': 'Equipment',
      'software': 'Software',
      'security': 'Security',
      'other': 'Other'
    };
    
    return categories[categoryKey] || categoryKey;
  };

  // Get unique categories from complaints
  const categories = loading 
    ? [] 
    : [...new Set(complaints.map(c => c.category))];

  return loading ? (
    <Spinner />
  ) : (
    <Container>
      <div className="d-flex align-items-center mb-4">
        <Button 
          as={Link} 
          to="/dashboard" 
          variant="link" 
          className="ps-0 text-decoration-none"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          Back to Dashboard
        </Button>
      </div>
      
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-white">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
            <h4 className="mb-3 mb-md-0">My Complaints</h4>
            <Button 
              as={Link} 
              to="/create-complaint" 
              variant="primary"
            >
              Submit New Complaint
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="mb-4">
            <Row className="g-3">
              <Col md={4}>
                <InputGroup>
                  <InputGroup.Text>
                    <FontAwesomeIcon icon={faSearch} />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search complaints..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col md={8}>
                <div className="d-flex flex-column flex-md-row gap-2">
                  <Form.Group className="d-flex align-items-center me-3">
                    <FontAwesomeIcon icon={faFilter} className="me-2 text-muted" />
                    <Form.Select
                      value={filterStatus}
                      onChange={e => setFilterStatus(e.target.value)}
                      className="form-select-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </Form.Select>
                  </Form.Group>
                  
                  <Form.Group className="d-flex align-items-center me-3">
                    <FontAwesomeIcon icon={faFilter} className="me-2 text-muted" />
                    <Form.Select
                      value={filterCategory}
                      onChange={e => setFilterCategory(e.target.value)}
                      className="form-select-sm"
                    >
                      <option value="all">All Categories</option>
                      {categories.map((category, index) => (
                        <option key={index} value={category}>
                          {getCategoryName(category)}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  
                  <Form.Group className="d-flex align-items-center">
                    <FontAwesomeIcon icon={faSortAmountDown} className="me-2 text-muted" />
                    <Form.Select
                      value={sortBy}
                      onChange={e => setSortBy(e.target.value)}
                      className="form-select-sm"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="status">By Status</option>
                      <option value="priority">By Priority</option>
                    </Form.Select>
                  </Form.Group>
                </div>
              </Col>
            </Row>
          </div>
          
          <div className="table-responsive">
            <Table hover>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Submitted Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.length > 0 ? (
                  filteredComplaints.map(complaint => (
                    <tr key={complaint._id} className="complaint-item">
                      <td>{complaint.title}</td>
                      <td>{getCategoryName(complaint.category)}</td>
                      <td>{getStatusBadge(complaint.status)}</td>
                      <td>{getPriorityBadge(complaint.priority)}</td>
                      <td>{moment(complaint.submittedDate).format('MMM DD, YYYY')}</td>
                      <td>
                        <Button 
                          as={Link} 
                          to={`/complaints/${complaint._id}`} 
                          variant="outline-primary" 
                          size="sm"
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      {searchTerm || filterStatus !== 'all' || filterCategory !== 'all' ? (
                        <p className="mb-0">No complaints match your filters.</p>
                      ) : (
                        <>
                          <p className="mb-2">You haven't submitted any complaints yet.</p>
                          <Button 
                            as={Link} 
                            to="/create-complaint" 
                            variant="primary"
                          >
                            Submit Your First Complaint
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

ComplaintsList.propTypes = {
  getComplaints: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  complaint: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  complaint: state.complaint
});

export default connect(mapStateToProps, { getComplaints })(ComplaintsList);
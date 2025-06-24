import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getComplaints } from '../../actions/complaint';
import Spinner from '../layout/Spinner';
import { Container, Row, Col, Card, Button, Badge, Form, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faSearch, faClock, faExclamationTriangle, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { Pie } from 'react-chartjs-2';
import moment from 'moment';

const DepartmentHeadDashboard = ({
  getComplaints,
  auth: { user },
  complaint: { complaints, loading }
}) => {
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    highPriority: 0,
    avgResolutionTime: 0
  });
  
  const [chartData, setChartData] = useState({
    labels: ['Pending', 'In Progress', 'Resolved'],
    datasets: [
      {
        data: [0, 0, 0],
        backgroundColor: ['#ffc107', '#0d6efd', '#198754']
      }
    ]
  });

  useEffect(() => {
    getComplaints();
  }, [getComplaints]);

  useEffect(() => {
    if (!loading && user) {
      const departmentComplaints = complaints.filter(
        complaint => complaint.department === user.department
      );
      
      applyFilters(departmentComplaints);
      calculateStats(departmentComplaints);
    }
  }, [loading, complaints, user, filterStatus, filterPriority, searchTerm]);

  const applyFilters = complaints => {
    let filtered = [...complaints];
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(c => c.status === filterStatus);
    }
    
    if (filterPriority !== 'all') {
      filtered = filtered.filter(c => c.priority === filterPriority);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        c => c.title.toLowerCase().includes(term) || 
             c.description.toLowerCase().includes(term) ||
             (c.submittedBy && c.submittedBy.name.toLowerCase().includes(term))
      );
    }
    
    setFilteredComplaints(filtered);
  };
  
  const calculateStats = complaints => {
    const pendingCount = complaints.filter(c => c.status === 'pending').length;
    const inProgressCount = complaints.filter(c => c.status === 'in_progress').length;
    const resolvedCount = complaints.filter(c => c.status === 'resolved').length;
    const highPriorityCount = complaints.filter(c => c.priority === 'high').length;
    
    let totalResolutionTime = 0;
    let resolvedWithTimeCount = 0;
    
    complaints.forEach(complaint => {
      if (complaint.status === 'resolved' && complaint.resolvedDate) {
        const submitDate = new Date(complaint.submittedDate);
        const resolveDate = new Date(complaint.resolvedDate);
        const timeDiff = resolveDate - submitDate;
        const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
        
        totalResolutionTime += daysDiff;
        resolvedWithTimeCount++;
      }
    });
    
    const avgResolutionTime = resolvedWithTimeCount > 0 
      ? (totalResolutionTime / resolvedWithTimeCount).toFixed(1) 
      : 0;
    
    setStats({
      total: complaints.length,
      pending: pendingCount,
      inProgress: inProgressCount,
      resolved: resolvedCount,
      highPriority: highPriorityCount,
      avgResolutionTime
    });
    
    setChartData({
      labels: ['Pending', 'In Progress', 'Resolved'],
      datasets: [
        {
          data: [pendingCount, inProgressCount, resolvedCount],
          backgroundColor: ['#ffc107', '#0d6efd', '#198754']
        }
      ]
    });
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

  return loading ? (
    <Spinner />
  ) : (
    <Container>
      <h1 className="mb-4">Department Head Dashboard</h1>
      
      {user && (
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <Row>
              <Col md={8}>
                <h4 className="mb-2">Welcome, {user.name}</h4>
                <p className="text-muted mb-0">
                  You are managing complaints for the <strong>{user.department}</strong> department
                </p>
              </Col>
              <Col md={4} className="d-flex justify-content-end align-items-center">
                <div className="user-avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '40px', height: '40px' }}>
                  <FontAwesomeIcon icon={faUserCircle} />
                </div>
                <div>
                  <p className="mb-0 fw-bold">{user.name}</p>
                  <small className="text-muted">{user.email}</small>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}
      
      <Row className="mb-4">
        <Col md={3}>
          <Card className="shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="display-4 fw-bold text-primary mb-2">{stats.total}</div>
              <Card.Title>Total Complaints</Card.Title>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="display-4 fw-bold text-warning mb-2">{stats.pending}</div>
              <Card.Title>Pending</Card.Title>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="display-4 fw-bold text-danger mb-2">{stats.highPriority}</div>
              <Card.Title>High Priority</Card.Title>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="display-4 fw-bold text-success mb-2">{stats.avgResolutionTime}</div>
              <Card.Title>Avg. Resolution Time (Days)</Card.Title>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="mb-4">
        <Col md={5}>
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Status Distribution</h5>
            </Card.Header>
            <Card.Body className="d-flex align-items-center justify-content-center">
              <div style={{ height: '250px', width: '100%' }}>
                <Pie 
                  data={chartData} 
                  options={{ 
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }} 
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={7}>
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Urgent Action Required</h5>
            </Card.Header>
            <Card.Body>
              {filteredComplaints
                .filter(complaint => complaint.priority === 'high' && complaint.status !== 'resolved')
                .slice(0, 4)
                .map((complaint, index) => (
                  <div 
                    key={complaint._id} 
                    className={`alert alert-danger d-flex justify-content-between align-items-center ${index < 3 ? 'mb-3' : 'mb-0'}`}
                  >
                    <div>
                      <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                      <strong>{complaint.title}</strong>
                      <div className="small">
                        <FontAwesomeIcon icon={faClock} className="me-1" /> 
                        Submitted {moment(complaint.submittedDate).fromNow()}
                      </div>
                    </div>
                    <Button 
                      as={Link} 
                      to={`/complaints/${complaint._id}`}
                      variant="outline-danger"
                      size="sm"
                    >
                      View
                    </Button>
                  </div>
                ))}
                
              {filteredComplaints.filter(complaint => complaint.priority === 'high' && complaint.status !== 'resolved').length === 0 && (
                <div className="text-center py-4">
                  <p className="mb-0">No high priority complaints requiring action.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-white">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Department Complaints</h5>
            <div className="d-flex">
              <Form.Control
                type="text"
                placeholder="Search complaints..."
                className="me-2"
                style={{ width: '200px' }}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <Button variant="outline-primary" size="sm">
                <FontAwesomeIcon icon={faSearch} />
              </Button>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="filters mb-3">
            <Row>
              <Col md={6}>
                <Form.Group>
                  <Form.Label><FontAwesomeIcon icon={faFilter} className="me-1" /> Status</Form.Label>
                  <Form.Select 
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label><FontAwesomeIcon icon={faFilter} className="me-1" /> Priority</Form.Label>
                  <Form.Select 
                    value={filterPriority}
                    onChange={e => setFilterPriority(e.target.value)}
                  >
                    <option value="all">All Priorities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </div>
          
          <div className="table-responsive">
            <Table hover>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Submitted By</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.length > 0 ? (
                  filteredComplaints.map(complaint => (
                    <tr key={complaint._id}>
                      <td>{complaint.title}</td>
                      <td>{complaint.submittedBy?.name || 'Unknown'}</td>
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
                          View
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      No complaints found matching your filters.
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

DepartmentHeadDashboard.propTypes = {
  getComplaints: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  complaint: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  complaint: state.complaint
});

export default connect(mapStateToProps, { getComplaints })(DepartmentHeadDashboard);
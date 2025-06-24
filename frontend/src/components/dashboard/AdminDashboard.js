import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getComplaints } from '../../actions/complaint';
import { getDepartments } from '../../actions/department';
import Spinner from '../layout/Spinner';
import { Container, Row, Col, Card, Button, Form, Table, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faBuilding, faChartBar, faFilter, faSearch } from '@fortawesome/free-solid-svg-icons';
import { Bar, Pie } from 'react-chartjs-2';
import moment from 'moment';

const AdminDashboard = ({
  getComplaints,
  getDepartments,
  auth: { user },
  complaint: { complaints, loading: complaintsLoading },
  department: { departments, loading: departmentsLoading }
}) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    avgResolutionTime: 0,
    byDepartment: {},
    byCategory: {}
  });

  useEffect(() => {
    getComplaints();
    getDepartments();
  }, [getComplaints, getDepartments]);

  useEffect(() => {
    if (!complaintsLoading && !departmentsLoading && complaints && departments) {
      calculateStats();
    }
  }, [complaintsLoading, departmentsLoading, complaints, departments]);

  const calculateStats = () => {
    const pendingCount = complaints.filter(c => c.status === 'pending').length;
    const inProgressCount = complaints.filter(c => c.status === 'in_progress').length;
    const resolvedCount = complaints.filter(c => c.status === 'resolved').length;
    
    // Calculate average resolution time in days
    let totalResolutionTime = 0;
    let resolvedCount2 = 0;
    complaints.forEach(complaint => {
      if (complaint.status === 'resolved' && complaint.resolvedDate) {
        const submitDate = new Date(complaint.submittedDate);
        const resolveDate = new Date(complaint.resolvedDate);
        const timeDiff = resolveDate - submitDate;
        totalResolutionTime += timeDiff / (1000 * 60 * 60 * 24); // Convert to days
        resolvedCount2++;
      }
    });
    
    const avgResolutionTime = resolvedCount2 > 0 ? 
      (totalResolutionTime / resolvedCount2).toFixed(1) : 0;
    
    // Complaints by department
    const byDepartment = {};
    departments.forEach(dept => {
      byDepartment[dept.name] = complaints.filter(c => c.department === dept.name).length;
    });
    
    // Complaints by category
    const byCategory = {};
    complaints.forEach(complaint => {
      if (!byCategory[complaint.category]) {
        byCategory[complaint.category] = 0;
      }
      byCategory[complaint.category]++;
    });
    
    setStats({
      total: complaints.length,
      pending: pendingCount,
      inProgress: inProgressCount,
      resolved: resolvedCount,
      avgResolutionTime,
      byDepartment,
      byCategory
    });
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesStatus = filterStatus === 'all' || complaint.status === filterStatus;
    const matchesDepartment = filterDepartment === 'all' || complaint.department === filterDepartment;
    const matchesPriority = filterPriority === 'all' || complaint.priority === filterPriority;
    const matchesSearch = searchTerm === '' || 
      complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesDepartment && matchesPriority && matchesSearch;
  });

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

  // Chart data for status distribution
  const statusChartData = {
    labels: ['Pending', 'In Progress', 'Resolved'],
    datasets: [
      {
        data: [stats.pending, stats.inProgress, stats.resolved],
        backgroundColor: ['#ffc107', '#0d6efd', '#198754'],
        borderWidth: 0
      }
    ]
  };

  // Chart data for department distribution
  const departmentChartData = {
    labels: Object.keys(stats.byDepartment),
    datasets: [
      {
        label: 'Complaints by Department',
        data: Object.values(stats.byDepartment),
        backgroundColor: [
          '#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b',
          '#6f42c1', '#5a5c69', '#20c997', '#6610f2', '#fd7e14'
        ],
        borderWidth: 1
      }
    ]
  };

  return (complaintsLoading || departmentsLoading) ? (
    <Spinner />
  ) : (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Admin Dashboard</h1>
        <div>
          <Button 
            as={Link} 
            to="/admin/users" 
            variant="outline-primary" 
            className="me-2"
          >
            <FontAwesomeIcon icon={faUsers} className="me-2" />
            Users
          </Button>
          <Button 
            as={Link} 
            to="/admin/departments" 
            variant="outline-primary" 
            className="me-2"
          >
            <FontAwesomeIcon icon={faBuilding} className="me-2" />
            Departments
          </Button>
          <Button 
            as={Link} 
            to="/admin/analytics" 
            variant="outline-primary"
          >
            <FontAwesomeIcon icon={faChartBar} className="me-2" />
            Analytics
          </Button>
        </div>
      </div>

      <Row className="mb-4">
        <Col md={3}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-uppercase text-muted mb-2">Total Complaints</h6>
                  <h2 className="mb-0">{stats.total}</h2>
                </div>
                <div className="icon-circle bg-primary">
                  <i className="fas fa-file-alt text-white"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-uppercase text-muted mb-2">Pending</h6>
                  <h2 className="mb-0">{stats.pending}</h2>
                </div>
                <div className="icon-circle bg-warning">
                  <i className="fas fa-clock text-white"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-uppercase text-muted mb-2">Resolved</h6>
                  <h2 className="mb-0">{stats.resolved}</h2>
                </div>
                <div className="icon-circle bg-success">
                  <i className="fas fa-check text-white"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-uppercase text-muted mb-2">Avg. Resolution Time</h6>
                  <h2 className="mb-0">{stats.avgResolutionTime} days</h2>
                </div>
                <div className="icon-circle bg-info">
                  <i className="fas fa-calendar text-white"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6}>
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Status Distribution</h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '300px' }}>
                <Pie data={statusChartData} options={{ maintainAspectRatio: false }} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Complaints by Department</h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '300px' }}>
                <Bar 
                  data={departmentChartData} 
                  options={{ 
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }} 
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-white">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Complaint Management</h5>
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
              <Col md={4}>
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
              <Col md={4}>
                <Form.Group>
                  <Form.Label><FontAwesomeIcon icon={faFilter} className="me-1" /> Department</Form.Label>
                  <Form.Select 
                    value={filterDepartment}
                    onChange={e => setFilterDepartment(e.target.value)}
                  >
                    <option value="all">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept._id} value={dept.name}>
                        {dept.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
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
                  <th>ID</th>
                  <th>Title</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Submitted By</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.length > 0 ? (
                  filteredComplaints.map(complaint => (
                    <tr key={complaint._id}>
                      <td>{complaint._id.substring(complaint._id.length - 6)}</td>
                      <td>{complaint.title}</td>
                      <td>{complaint.department}</td>
                      <td>{getStatusBadge(complaint.status)}</td>
                      <td>{getPriorityBadge(complaint.priority)}</td>
                      <td>{complaint.submittedBy?.name || 'Unknown'}</td>
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
                    <td colSpan="8" className="text-center py-4">
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

AdminDashboard.propTypes = {
  getComplaints: PropTypes.func.isRequired,
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
  { getComplaints, getDepartments }
)(AdminDashboard);
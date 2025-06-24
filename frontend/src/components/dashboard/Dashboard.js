import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getComplaints } from '../../actions/complaint';
import Spinner from '../layout/Spinner';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faList, faCheck, faClock, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';

const Dashboard = ({
  getComplaints,
  auth: { user },
  complaint: { complaints, loading }
}) => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    recent: []
  });

  useEffect(() => {
    getComplaints();
  }, [getComplaints]);

  useEffect(() => {
    if (!loading && complaints) {
      const pendingCount = complaints.filter(c => c.status === 'pending').length;
      const inProgressCount = complaints.filter(c => c.status === 'in_progress').length;
      const resolvedCount = complaints.filter(c => c.status === 'resolved').length;
      
      // Get 5 most recent complaints
      const recentComplaints = [...complaints]
        .sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate))
        .slice(0, 5);
        
      setStats({
        total: complaints.length,
        pending: pendingCount,
        inProgress: inProgressCount,
        resolved: resolvedCount,
        recent: recentComplaints
      });
    }
  }, [complaints, loading]);

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

  return loading ? (
    <Spinner />
  ) : (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Staff Dashboard</h1>
        <div>
          <Button 
            as={Link} 
            to="/create-complaint" 
            variant="primary" 
            className="me-2"
          >
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            New Complaint
          </Button>
          <Button 
            as={Link} 
            to="/complaints" 
            variant="outline-secondary"
          >
            <FontAwesomeIcon icon={faList} className="me-2" />
            View All
          </Button>
        </div>
      </div>

      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <div className="display-4 fw-bold text-primary mb-2">{stats.total}</div>
              <Card.Title>Total Complaints</Card.Title>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <div className="display-4 fw-bold text-warning mb-2">{stats.pending}</div>
              <Card.Title>Pending</Card.Title>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <div className="display-4 fw-bold text-primary mb-2">{stats.inProgress}</div>
              <Card.Title>In Progress</Card.Title>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <div className="display-4 fw-bold text-success mb-2">{stats.resolved}</div>
              <Card.Title>Resolved</Card.Title>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <h4 className="mb-3">Recent Complaints</h4>
      <Card className="shadow-sm">
        <Card.Body>
          {stats.recent.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recent.map(complaint => (
                    <tr key={complaint._id}>
                      <td>{complaint.title}</td>
                      <td>{complaint.category.replace('_', ' ')}</td>
                      <td>{getStatusBadge(complaint.status)}</td>
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
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5">
              <FontAwesomeIcon icon={faExclamationTriangle} size="3x" className="text-muted mb-3" />
              <p className="lead mb-0">You haven't submitted any complaints yet.</p>
              <p className="mb-4">Click the button below to create your first complaint.</p>
              <Button 
                as={Link} 
                to="/create-complaint" 
                variant="primary"
              >
                <FontAwesomeIcon icon={faPlus} className="me-2" />
                Submit a Complaint
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

Dashboard.propTypes = {
  getComplaints: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  complaint: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  complaint: state.complaint
});

export default connect(mapStateToProps, { getComplaints })(Dashboard);
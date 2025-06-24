import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboardCheck, faClock, faChartLine, faComment } from '@fortawesome/free-solid-svg-icons';

const Landing = ({ isAuthenticated }) => {
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="landing">
      <div className="landing-hero py-5">
        <Container>
          <Row className="align-items-center">
            <Col md={7}>
              <h1 className="display-4 fw-bold mb-4">Staff Complaint Management System</h1>
              <p className="lead mb-4">
                A streamlined platform for staff to submit, track and resolve complaints efficiently.
                Improve communication and reduce resolution times.
              </p>
              <div className="d-flex flex-wrap">
                <Button as={Link} to="/register" variant="primary" size="lg" className="me-3 mb-3">
                  Get Started
                </Button>
                <Button as={Link} to="/login" variant="outline-light" size="lg" className="mb-3">
                  Login
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
      
      <Container className="py-5">
        <h2 className="text-center mb-5">Key Features</h2>
        <Row>
          <Col md={3} className="mb-4">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center p-4">
                <div className="icon-circle bg-primary text-white mx-auto mb-4">
                  <FontAwesomeIcon icon={faClipboardCheck} size="lg" />
                </div>
                <Card.Title>Easy Submission</Card.Title>
                <Card.Text>
                  Submit complaints with details, categories, and attachments in just a few clicks.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-4">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center p-4">
                <div className="icon-circle bg-success text-white mx-auto mb-4">
                  <FontAwesomeIcon icon={faClock} size="lg" />
                </div>
                <Card.Title>Real-time Tracking</Card.Title>
                <Card.Text>
                  Monitor the status of your complaints from submission to resolution in real time.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-4">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center p-4">
                <div className="icon-circle bg-info text-white mx-auto mb-4">
                  <FontAwesomeIcon icon={faChartLine} size="lg" />
                </div>
                <Card.Title>Advanced Analytics</Card.Title>
                <Card.Text>
                  Administrators can view comprehensive dashboards with key performance metrics.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-4">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center p-4">
                <div className="icon-circle bg-warning text-white mx-auto mb-4">
                  <FontAwesomeIcon icon={faComment} size="lg" />
                </div>
                <Card.Title>Seamless Communication</Card.Title>
                <Card.Text>
                  Add comments and receive notifications as your complaint progresses toward resolution.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      
      <div className="bg-light py-5">
        <Container className="text-center">
          <h2 className="mb-4">Ready to get started?</h2>
          <p className="lead mb-4">Join our platform and streamline your complaint management process.</p>
          <Button as={Link} to="/register" variant="primary" size="lg">
            Register Now
          </Button>
        </Container>
      </div>
    </div>
  );
};

Landing.propTypes = {
  isAuthenticated: PropTypes.bool
};

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated
});

export default connect(mapStateToProps)(Landing);
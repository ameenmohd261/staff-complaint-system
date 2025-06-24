import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPhone, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <Container>
        <Row>
          <Col md={4} className="mb-4 mb-md-0">
            <h5>Staff Complaint Management</h5>
            <p className="text-muted">
              A platform designed to streamline the process of submitting, managing, and resolving staff complaints efficiently.
            </p>
          </Col>
          <Col md={4} className="mb-4 mb-md-0">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><a href="/" className="text-decoration-none text-muted">Home</a></li>
              <li><a href="/login" className="text-decoration-none text-muted">Login</a></li>
              <li><a href="/register" className="text-decoration-none text-muted">Register</a></li>
              <li><a href="#!" className="text-decoration-none text-muted">Privacy Policy</a></li>
              <li><a href="#!" className="text-decoration-none text-muted">Terms of Service</a></li>
            </ul>
          </Col>
          <Col md={4}>
            <h5>Contact Us</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                123 Business Avenue, Corporate Park
              </li>
              <li className="mb-2">
                <FontAwesomeIcon icon={faPhone} className="me-2" />
                (123) 456-7890
              </li>
              <li className="mb-2">
                <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                support@complaintmanagement.com
              </li>
            </ul>
          </Col>
        </Row>
        <hr className="my-4 bg-light" />
        <div className="text-center">
          <p className="mb-0">&copy; {currentYear} Mohd Ameen Developer. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { login } from '../../actions/auth';
import { Form, Button, Card, Container, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons';
// import { Link, Navigate } from 'react-router-dom';


const Login = ({ login, isAuthenticated, user }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const { email, password } = formData;

  const onChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = e => {
    e.preventDefault();
    login(email, password);
  };

  // Redirect if logged in
  if (isAuthenticated) {
    if (user) {
      if (user.role === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
      } else if (user.role === 'department_head') {
        return <Navigate to="/dept-head/dashboard" replace />;
      } else {
        return <Navigate to="/dashboard" replace />;
      }
    }
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow border-0">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <FontAwesomeIcon icon={faSignInAlt} size="3x" className="text-primary mb-3" />
                <h2>Staff Login</h2>
                <p className="text-muted">
                  Sign in to access the complaint management system
                </p>
              </div>
              
              <Form onSubmit={onSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={email}
                    onChange={onChange}
                    placeholder="Enter your email"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={password}
                    onChange={onChange}
                    placeholder="Enter your password"
                    minLength="6"
                    required
                  />
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 py-2 mb-3"
                >
                  Login
                </Button>
                
                <div className="text-center">
                  <p className="mb-0">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary">
                      Sign Up
                    </Link>
                  </p>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

Login.propTypes = {
  login: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool,
  user: PropTypes.object
};

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated,
  user: state.auth.user
});

export default connect(mapStateToProps, { login })(Login);
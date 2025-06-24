import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { setAlert } from '../../actions/alert';
import { register } from '../../actions/auth';
import { getDepartments } from '../../actions/department';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';

const Register = ({ 
  setAlert, 
  register, 
  getDepartments,
  isAuthenticated,
  department: { departments, loading: departmentsLoading } 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: '',
    department: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { name, email, password, password2, department } = formData;

  useEffect(() => {
    getDepartments();
  }, [getDepartments]);

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: '', variant: '' };
    
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const length = password.length >= 8;
    
    const checks = [hasLower, hasUpper, hasDigit, hasSpecial, length];
    const passedChecks = checks.filter(Boolean).length;
    
    if (passedChecks <= 1) return { strength: 20, text: 'Very Weak', variant: 'danger' };
    if (passedChecks === 2) return { strength: 40, text: 'Weak', variant: 'warning' };
    if (passedChecks === 3) return { strength: 60, text: 'Medium', variant: 'info' };
    if (passedChecks === 4) return { strength: 80, text: 'Strong', variant: 'primary' };
    return { strength: 100, text: 'Very Strong', variant: 'success' };
  };
  
  const passwordStrength = getPasswordStrength(password);

  const onChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    if (password !== password2) {
      setAlert('Passwords do not match', 'danger');
    } else {
      setIsSubmitting(true);
      try {
        await register({ name, email, password, department });
        // Registration is handled by the action, we just need to manage UI state
      } catch (error) {
        console.error('Registration error:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow border-0">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <FontAwesomeIcon icon={faUserPlus} size="3x" className="text-primary mb-3" />
                <h2>Staff Registration</h2>
                <p className="text-muted">
                  Create your account to submit and track complaints
                </p>
              </div>
              
              <Form onSubmit={onSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={name}
                    onChange={onChange}
                    placeholder="Enter your full name"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={email}
                    onChange={onChange}
                    placeholder="Enter your work email"
                    required
                  />
                  <Form.Text className="text-muted">
                    We'll never share your email with anyone else.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Department</Form.Label>
                  <Form.Select
                    name="department"
                    value={department}
                    onChange={onChange}
                    required
                  >
                    <option value="">Select Your Department</option>
                    {!departmentsLoading && departments.length > 0 ? (
                      departments.map(dept => (
                        <option key={dept._id} value={dept._id}>
                          {dept.name}
                        </option>
                      ))
                    ) : (
                      <>
                        <optgroup label="Administrative & Operations">
                          <option value="administration">Administration</option>
                          <option value="facilities">Facilities & Maintenance</option>
                          <option value="transport">Transport / Logistics</option>
                          <option value="procurement">Procurement</option>
                        </optgroup>
                        <optgroup label="Academic & Training">
                          <option value="teaching">Teaching Staff</option>
                          <option value="examination">Examination Cell</option>
                          <option value="library">Library</option>
                          <option value="lab">Lab & Technical Support</option>
                        </optgroup>
                        <optgroup label="IT & Technical">
                          <option value="it-support">IT Support / Helpdesk</option>
                          <option value="development">Software / Web Development</option>
                          <option value="network">Network & Infrastructure</option>
                        </optgroup>
                        <optgroup label="HR & Management">
                          <option value="hr">Human Resources</option>
                        </optgroup>
                      </>
                    )}
                </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={password}
                    onChange={onChange}
                    placeholder="Create a password"
                    minLength="6"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="d-flex justify-content-between">
                    <span>Password Strength</span>
                    <span className={`text-${passwordStrength.variant}`}>{passwordStrength.text}</span>
                  </Form.Label>
                  <div className="progress" style={{ height: '6px' }}>
                    <div 
                      className={`progress-bar bg-${passwordStrength.variant}`}
                      role="progressbar"
                      style={{ width: `${passwordStrength.strength}%` }}
                      aria-valuenow={passwordStrength.strength}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    />
                  </div>
                  <small className="form-text text-muted mt-1">
                    Use 8+ characters with a mix of letters, numbers & symbols
                  </small>
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password2"
                    value={password2}
                    onChange={onChange}
                    placeholder="Confirm your password"
                    minLength="6"
                    required
                  />
                </Form.Group>
                
                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 py-2 mb-3"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Registering...' : 'Register'}
                </Button>
                
                <div className="text-center">
                  <p className="mb-0">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary fw-bold">Login here</Link>
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

Register.propTypes = {
  setAlert: PropTypes.func.isRequired,
  register: PropTypes.func.isRequired,
  getDepartments: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool,
  department: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated,
  department: state.department
});

export default connect(mapStateToProps, { setAlert, register, getDepartments })(Register);
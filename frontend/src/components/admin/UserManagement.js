import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import axios from 'axios';
import { setAlert } from '../../actions/alert';
import { getDepartments } from '../../actions/department';
import Spinner from '../layout/Spinner';
import { Container, Card, Button, Table, Badge, Modal, Form, Row, Col, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPlus, faEdit, faTrash, faSearch, faFilter } from '@fortawesome/free-solid-svg-icons';
import setAuthToken from '../../utils/setAuthToken';

const UserManagement = ({ 
  setAlert, 
  getDepartments,
  department: { departments, loading: deptLoading } 
}) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    role: 'staff'
  });
  
  const { name, email, password, department, role } = formData;
  
  useEffect(() => {
    getDepartments();
    fetchUsers();
  }, [getDepartments]);
  
  const fetchUsers = async () => {
    try {
      if (localStorage.token) {
        setAuthToken(localStorage.token);
      }
      
      const res = await axios.get('/api/users');
      setUsers(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setAlert('Failed to fetch users', 'danger');
      setLoading(false);
    }
  };
  
  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const openAddModal = () => {
    setCurrentUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      department: '',
      role: 'staff'
    });
    setShowModal(true);
  };
  
  const openEditModal = user => {
    setCurrentUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      department: user.department,
      role: user.role
    });
    setShowModal(true);
  };
  
  const onSubmit = async e => {
    e.preventDefault();
    
    try {
      if (currentUser) {
        // Update user
        const updateData = {
          name,
          department,
          role
        };
        
        if (password) {
          updateData.password = password;
        }
        
        await axios.put(`/api/users/${currentUser._id}`, updateData);
        setAlert('User updated successfully', 'success');
      } else {
        // Create user
        await axios.post('/api/users', formData);
        setAlert('User created successfully', 'success');
      }
      
      fetchUsers();
      setShowModal(false);
    } catch (err) {
      const errors = err.response.data.errors;
      
      if (errors) {
        errors.forEach(error => setAlert(error.msg, 'danger'));
      } else {
        setAlert('Failed to save user', 'danger');
      }
    }
  };
  
  const deleteUser = async userId => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/api/users/${userId}`);
        fetchUsers();
        setAlert('User deleted successfully', 'success');
      } catch (err) {
        setAlert('Failed to delete user', 'danger');
      }
    }
  };
  
  const getRoleBadge = role => {
    switch (role) {
      case 'admin':
        return <Badge bg="danger">Admin</Badge>;
      case 'department_head':
        return <Badge bg="info">Department Head</Badge>;
      case 'staff':
        return <Badge bg="secondary">Staff</Badge>;
      default:
        return <Badge bg="secondary">Staff</Badge>;
    }
  };
  
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesDepartment = filterDepartment === 'all' || user.department === filterDepartment;
    
    return matchesSearch && matchesRole && matchesDepartment;
  });
  
  return loading || deptLoading ? (
    <Spinner />
  ) : (
    <Container>
      <div className="d-flex align-items-center mb-4">
        <Button 
          as={Link} 
          to="/admin/dashboard" 
          variant="link" 
          className="ps-0 text-decoration-none"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          Back to Admin Dashboard
        </Button>
      </div>
      
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-white">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">User Management</h4>
            <Button 
              variant="primary" 
              onClick={openAddModal}
            >
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              Add User
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="mb-4">
            <Row>
              <Col md={4}>
                <InputGroup>
                  <InputGroup.Text>
                    <FontAwesomeIcon icon={faSearch} />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col md={8}>
                <div className="d-flex">
                  <Form.Group className="d-flex align-items-center me-3">
                    <FontAwesomeIcon icon={faFilter} className="me-2 text-muted" />
                    <Form.Select
                      value={filterRole}
                      onChange={e => setFilterRole(e.target.value)}
                      className="form-select-sm"
                    >
                      <option value="all">All Roles</option>
                      <option value="admin">Admin</option>
                      <option value="department_head">Department Head</option>
                      <option value="staff">Staff</option>
                    </Form.Select>
                  </Form.Group>
                  
                  <Form.Group className="d-flex align-items-center">
                    <FontAwesomeIcon icon={faFilter} className="me-2 text-muted" />
                    <Form.Select
                      value={filterDepartment}
                      onChange={e => setFilterDepartment(e.target.value)}
                      className="form-select-sm"
                    >
                      <option value="all">All Departments</option>
                      {departments.map(dept => (
                        <option key={dept._id} value={dept.name}>
                          {dept.name}
                        </option>
                      ))}
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
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Role</th>
                  <th>Registered Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.department}</td>
                      <td>{getRoleBadge(user.role)}</td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => openEditModal(user)}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => deleteUser(user._id)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      No users found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
      
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{currentUser ? 'Edit User' : 'Add New User'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={onSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={name}
                    onChange={onChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={email}
                    onChange={onChange}
                    required
                    disabled={currentUser !== null}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Department</Form.Label>
                  <Form.Select
                    name="department"
                    value={department}
                    onChange={onChange}
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept._id} value={dept.name}>
                        {dept.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Role</Form.Label>
                  <Form.Select
                    name="role"
                    value={role}
                    onChange={onChange}
                    required
                  >
                    <option value="staff">Staff</option>
                    <option value="department_head">Department Head</option>
                    <option value="admin">Admin</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>{currentUser ? 'New Password (leave blank to keep current)' : 'Password'}</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={password}
                onChange={onChange}
                required={currentUser === null}
                minLength="6"
              />
              {currentUser && (
                <Form.Text className="text-muted">
                  Only fill this if you want to change the password.
                </Form.Text>
              )}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {currentUser ? 'Update User' : 'Add User'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

UserManagement.propTypes = {
  setAlert: PropTypes.func.isRequired,
  getDepartments: PropTypes.func.isRequired,
  department: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  department: state.department
});

export default connect(mapStateToProps, { setAlert, getDepartments })(UserManagement);
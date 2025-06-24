import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import axios from 'axios';
import { setAlert } from '../../actions/alert';
import { getDepartments, createDepartment, updateDepartment } from '../../actions/department';
import Spinner from '../layout/Spinner';
import { Container, Card, Button, Table, Modal, Form, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPlus, faEdit, faTrash, faSearch, faBuilding, faUser } from '@fortawesome/free-solid-svg-icons';

const DepartmentManagement = ({ 
  setAlert, 
  getDepartments, 
  createDepartment, 
  updateDepartment, 
  department: { departments, loading } 
}) => {
  const [showModal, setShowModal] = useState(false);
  const [currentDepartment, setCurrentDepartment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    head: ''
  });
  
  const { name, description, head } = formData;
  
  useEffect(() => {
    getDepartments();
    fetchUsers();
  }, [getDepartments]);
  
  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users');
      setUsers(res.data);
      setLoadingUsers(false);
    } catch (err) {
      console.error(err);
      setAlert('Failed to fetch users', 'danger');
      setLoadingUsers(false);
    }
  };
  
  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const openAddModal = () => {
    setCurrentDepartment(null);
    setFormData({
      name: '',
      description: '',
      head: ''
    });
    setShowModal(true);
  };
  
  const openEditModal = dept => {
    setCurrentDepartment(dept);
    setFormData({
      name: dept.name,
      description: dept.description || '',
      head: dept.head ? dept.head._id : ''
    });
    setShowModal(true);
  };
  
  const onSubmit = async e => {
    e.preventDefault();
    
    try {
      if (currentDepartment) {
        // Update department
        await updateDepartment(currentDepartment._id, formData);
        setAlert('Department updated successfully', 'success');
      } else {
        // Create department
        await createDepartment(formData);
        setAlert('Department created successfully', 'success');
      }
      
      getDepartments();
      setShowModal(false);
    } catch (err) {
      setAlert('Failed to save department', 'danger');
    }
  };
  
  const deleteDepartment = async deptId => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await axios.delete(`/api/departments/${deptId}`);
        getDepartments();
        setAlert('Department deleted successfully', 'success');
      } catch (err) {
        setAlert('Failed to delete department', 'danger');
      }
    }
  };
  
  const filteredDepartments = departments.filter(dept =>
    searchTerm === '' ||
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (dept.description && dept.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (dept.head && dept.head.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  return loading || loadingUsers ? (
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
            <h4 className="mb-0">Department Management</h4>
            <Button 
              variant="primary" 
              onClick={openAddModal}
            >
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              Add Department
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="mb-4">
            <InputGroup>
              <InputGroup.Text>
                <FontAwesomeIcon icon={faSearch} />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search departments..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </div>
          
          <div className="table-responsive">
            <Table hover>
              <thead>
                <tr>
                  <th>Department Name</th>
                  <th>Description</th>
                  <th>Department Head</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDepartments.length > 0 ? (
                  filteredDepartments.map(dept => (
                    <tr key={dept._id}>
                      <td>
                        <FontAwesomeIcon icon={faBuilding} className="me-2 text-primary" />
                        {dept.name}
                      </td>
                      <td>{dept.description || 'No description'}</td>
                      <td>
                        {dept.head ? (
                          <div className="d-flex align-items-center">
                            <FontAwesomeIcon icon={faUser} className="me-2 text-secondary" />
                            {dept.head.name}
                          </div>
                        ) : (
                          <span className="text-muted">Not assigned</span>
                        )}
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => openEditModal(dept)}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => deleteDepartment(dept._id)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-4">
                      No departments found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
      
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {currentDepartment ? 'Edit Department' : 'Add New Department'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={onSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Department Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={name}
                onChange={onChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={description}
                onChange={onChange}
                placeholder="Optional department description"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Department Head</Form.Label>
              <Form.Select
                name="head"
                value={head}
                onChange={onChange}
              >
                <option value="">-- Select Department Head (Optional) --</option>
                {users
                  .filter(user => user.role === 'department_head')
                  .map(user => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
              </Form.Select>
              <Form.Text className="text-muted">
                Only users with Department Head role are shown. You can assign a head later if needed.
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {currentDepartment ? 'Update Department' : 'Add Department'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

DepartmentManagement.propTypes = {
  setAlert: PropTypes.func.isRequired,
  getDepartments: PropTypes.func.isRequired,
  createDepartment: PropTypes.func.isRequired,
  updateDepartment: PropTypes.func.isRequired,
  department: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  department: state.department
});

export default connect(
  mapStateToProps, 
  { setAlert, getDepartments, createDepartment, updateDepartment }
)(DepartmentManagement);
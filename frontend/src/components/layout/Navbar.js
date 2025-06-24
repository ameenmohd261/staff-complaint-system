import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { logout } from '../../actions/auth';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faSignOutAlt, faTachometerAlt, faPlus, faClipboardList } from '@fortawesome/free-solid-svg-icons';

const MainNavbar = ({ 
  auth: { isAuthenticated, loading, user }, 
  logout 
}) => {
  const authLinks = (
    <Nav className="ms-auto">
      <NavDropdown 
        title={
          <span>
            <FontAwesomeIcon icon={faUserCircle} className="me-2" />
            {user && user.name}
          </span>
        } 
        id="user-dropdown"
      >
        {user && user.role === 'admin' && (
          <NavDropdown.Item as={Link} to="/admin/dashboard">
            <FontAwesomeIcon icon={faTachometerAlt} className="me-2" />
            Admin Dashboard
          </NavDropdown.Item>
        )}
        
        {user && user.role === 'department_head' && (
          <NavDropdown.Item as={Link} to="/dept-head/dashboard">
            <FontAwesomeIcon icon={faTachometerAlt} className="me-2" />
            Department Dashboard
          </NavDropdown.Item>
        )}
        
        {user && user.role === 'staff' && (
          <>
            <NavDropdown.Item as={Link} to="/dashboard">
              <FontAwesomeIcon icon={faTachometerAlt} className="me-2" />
              Dashboard
            </NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/create-complaint">
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              New Complaint
            </NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/complaints">
              <FontAwesomeIcon icon={faClipboardList} className="me-2" />
              My Complaints
            </NavDropdown.Item>
          </>
        )}
        
        <NavDropdown.Divider />
        <NavDropdown.Item onClick={logout} href="#!">
          <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
          Logout
        </NavDropdown.Item>
      </NavDropdown>
    </Nav>
  );

  const guestLinks = (
    <Nav className="ms-auto">
      <Nav.Link as={Link} to="/register">Register</Nav.Link>
      <Nav.Link as={Link} to="/login">Login</Nav.Link>
    </Nav>
  );

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/">
          SCMS
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          {!loading && (isAuthenticated ? authLinks : guestLinks)}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

MainNavbar.propTypes = {
  logout: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(mapStateToProps, { logout })(MainNavbar);
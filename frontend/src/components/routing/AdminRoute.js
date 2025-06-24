import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Spinner from '../layout/Spinner';

const AdminRoute = ({
  auth: { isAuthenticated, loading, user }
}) => {
  if (loading) return <Spinner />;
  return isAuthenticated && (user.role === 'admin' || user.role === 'department_head') ? 
    <Outlet /> : <Navigate to="/dashboard" replace />;
};

AdminRoute.propTypes = {
  auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(mapStateToProps)(AdminRoute);
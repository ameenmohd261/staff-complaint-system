import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Spinner from '../layout/Spinner';

const PrivateRoute = ({
  auth: { isAuthenticated, loading }
}) => {
  if (loading) return <Spinner />;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

PrivateRoute.propTypes = {
  auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(mapStateToProps)(PrivateRoute);
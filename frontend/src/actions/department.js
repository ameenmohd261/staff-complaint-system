import axios from 'axios';
import { setAlert } from './alert';
import {
  GET_DEPARTMENTS,
  ADD_DEPARTMENT,
  UPDATE_DEPARTMENT,
  DEPARTMENT_ERROR
} from './types';

// Get all departments
export const getDepartments = () => async dispatch => {
  try {
    const res = await axios.get('/api/departments');

    dispatch({
      type: GET_DEPARTMENTS,
      payload: res.data
    });
  } catch (err) {
    dispatch({
      type: DEPARTMENT_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

// Create department
export const createDepartment = formData => async dispatch => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const res = await axios.post('/api/departments', formData, config);

    dispatch({
      type: ADD_DEPARTMENT,
      payload: res.data
    });

    dispatch(setAlert('Department Created', 'success'));
    return res.data;
  } catch (err) {
    const errors = err.response.data.errors;

    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }

    dispatch({
      type: DEPARTMENT_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

// Update department
export const updateDepartment = (id, formData) => async dispatch => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const res = await axios.put(`/api/departments/${id}`, formData, config);

    dispatch({
      type: UPDATE_DEPARTMENT,
      payload: res.data
    });

    dispatch(setAlert('Department Updated', 'success'));
    return res.data;
  } catch (err) {
    const errors = err.response.data.errors;

    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }

    dispatch({
      type: DEPARTMENT_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};
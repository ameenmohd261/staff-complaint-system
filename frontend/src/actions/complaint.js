import axios from 'axios';
import { setAlert } from './alert';
import {
  GET_COMPLAINTS,
  GET_COMPLAINT,
  ADD_COMPLAINT,
  UPDATE_COMPLAINT,
  DELETE_COMPLAINT,
  COMPLAINT_ERROR,
  ADD_COMMENT,
  CLEAR_COMPLAINT
} from './types';

// Get all complaints
export const getComplaints = () => async dispatch => {
  try {
    const res = await axios.get('/api/complaints');

    dispatch({
      type: GET_COMPLAINTS,
      payload: res.data
    });
  } catch (err) {
    dispatch({
      type: COMPLAINT_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

// Get complaint by ID
export const getComplaintById = id => async dispatch => {
  try {
    const res = await axios.get(`/api/complaints/${id}`);

    dispatch({
      type: GET_COMPLAINT,
      payload: res.data
    });
  } catch (err) {
    dispatch({
      type: COMPLAINT_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

// Create complaint
export const createComplaint = (formData, history) => async dispatch => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const res = await axios.post('/api/complaints', formData, config);

    dispatch({
      type: ADD_COMPLAINT,
      payload: res.data
    });

    dispatch(setAlert('Complaint Submitted', 'success'));
    history.push('/dashboard');
  } catch (err) {
    const errors = err.response.data.errors;

    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }

    dispatch({
      type: COMPLAINT_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

// Upload complaint with attachments
export const createComplaintWithAttachments = (formData, history) => async dispatch => {
  try {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    };
    
    const res = await axios.post('/api/complaints', formData, config);

    dispatch({
      type: ADD_COMPLAINT,
      payload: res.data
    });

    dispatch(setAlert('Complaint Submitted', 'success'));
    history.push('/dashboard');
  } catch (err) {
    const errors = err.response.data.errors;

    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }

    dispatch({
      type: COMPLAINT_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

// Update complaint
export const updateComplaint = (id, formData) => async dispatch => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const res = await axios.put(`/api/complaints/${id}`, formData, config);

    dispatch({
      type: UPDATE_COMPLAINT,
      payload: res.data
    });

    dispatch(setAlert('Complaint Updated', 'success'));
    return res.data;
  } catch (err) {
    const errors = err.response.data.errors;

    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }

    dispatch({
      type: COMPLAINT_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

// Delete complaint
export const deleteComplaint = id => async dispatch => {
  if (window.confirm('Are you sure you want to delete this complaint?')) {
    try {
      await axios.delete(`/api/complaints/${id}`);

      dispatch({
        type: DELETE_COMPLAINT,
        payload: id
      });

      dispatch(setAlert('Complaint Removed', 'success'));
    } catch (err) {
      dispatch({
        type: COMPLAINT_ERROR,
        payload: { msg: err.response.statusText, status: err.response.status }
      });
    }
  }
};

// Add comment to complaint
export const addComment = (complaintId, formData) => async dispatch => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const res = await axios.post(
      `/api/complaints/${complaintId}/comments`,
      formData,
      config
    );

    dispatch({
      type: ADD_COMMENT,
      payload: res.data
    });

    dispatch(setAlert('Comment Added', 'success'));
    return res.data;
  } catch (err) {
    dispatch({
      type: COMPLAINT_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

// Clear current complaint
export const clearComplaint = () => dispatch => {
  dispatch({ type: CLEAR_COMPLAINT });
};
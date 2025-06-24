import {
  GET_COMPLAINTS,
  GET_COMPLAINT,
  COMPLAINT_ERROR,
  ADD_COMPLAINT,
  UPDATE_COMPLAINT,
  DELETE_COMPLAINT,
  ADD_COMMENT,
  CLEAR_COMPLAINT
} from '../actions/types';

const initialState = {
  complaints: [],
  complaint: null,
  loading: true,
  error: {}
};

export default function(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case GET_COMPLAINTS:
      return {
        ...state,
        complaints: payload,
        loading: false
      };
    case GET_COMPLAINT:
      return {
        ...state,
        complaint: payload,
        loading: false
      };
    case ADD_COMPLAINT:
      return {
        ...state,
        complaints: [payload, ...state.complaints],
        loading: false
      };
    case UPDATE_COMPLAINT:
      return {
        ...state,
        complaints: state.complaints.map(complaint =>
          complaint._id === payload._id ? payload : complaint
        ),
        complaint: payload,
        loading: false
      };
    case DELETE_COMPLAINT:
      return {
        ...state,
        complaints: state.complaints.filter(complaint => complaint._id !== payload),
        loading: false
      };
    case COMPLAINT_ERROR:
      return {
        ...state,
        error: payload,
        loading: false
      };
    case ADD_COMMENT:
      return {
        ...state,
        complaint: { ...state.complaint, comments: payload },
        loading: false
      };
    case CLEAR_COMPLAINT:
      return {
        ...state,
        complaint: null
      };
    default:
      return state;
  }
}
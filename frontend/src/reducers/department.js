import {
  GET_DEPARTMENTS,
  DEPARTMENT_ERROR,
  ADD_DEPARTMENT,
  UPDATE_DEPARTMENT
} from '../actions/types';

const initialState = {
  departments: [],
  loading: true,
  error: {}
};

export default function(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case GET_DEPARTMENTS:
      return {
        ...state,
        departments: payload,
        loading: false
      };
    case ADD_DEPARTMENT:
      return {
        ...state,
        departments: [payload, ...state.departments],
        loading: false
      };
    case UPDATE_DEPARTMENT:
      return {
        ...state,
        departments: state.departments.map(department =>
          department._id === payload._id ? payload : department
        ),
        loading: false
      };
    case DEPARTMENT_ERROR:
      return {
        ...state,
        error: payload,
        loading: false
      };
    default:
      return state;
  }
}
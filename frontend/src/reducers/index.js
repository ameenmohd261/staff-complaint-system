import { combineReducers } from 'redux';
import auth from './auth';
import alert from './alert';
import complaint from './complaint';
import department from './department';

export default combineReducers({
  auth,
  alert,
  complaint,
  department
});
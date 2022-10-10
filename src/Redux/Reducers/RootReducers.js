import { combineReducers } from 'redux';
import UserReducer from './UserReducers';
import MoblieuiReducer from './mobileui';

const rootReducer = combineReducers({
  UserReducer,
  MoblieuiReducer,
});

export default rootReducer;

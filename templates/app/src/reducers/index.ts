import { combineReducers } from 'redux';

import { reducer as application } from './application';

// Remember to update this when you add a new module
export default combineReducers({
  application
});

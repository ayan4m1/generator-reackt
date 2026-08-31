import { fork } from 'redux-saga/effects';

import application from './application';

// Remember to update this when you add a new module
export default function* saga() {
  yield fork(application);
}

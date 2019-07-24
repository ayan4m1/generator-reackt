import { fork } from 'redux-saga/effects';

import application from './application';

export default function* saga() {
  yield fork(application);
}

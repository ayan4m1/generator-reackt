import { all, fork } from 'redux-saga/effects';

import application from './application';

export default function* saga() {
  yield all([application].map(fork));
}

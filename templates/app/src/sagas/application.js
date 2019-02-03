import { all } from 'redux-saga/effects';

export const workers = {};

export const watchers = {};

export default function* saga() {
  yield all(Object.values(watchers));
}

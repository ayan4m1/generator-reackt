import { all } from 'redux-saga/effects';

export const workers: Record<string, CallableFunction> = {};

export const watchers: Record<string, CallableFunction> = {};

export default function* saga() {
  yield all(Object.values(watchers).map((watcher) => watcher()));
}

import { AppState } from '../types';

export const getApplication = (state: AppState) => state.application;

export const getApplicationInited = (state: AppState) =>
  getApplication(state).inited;

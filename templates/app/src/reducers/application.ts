import { ActionObject, AppState } from '../types';
import { buildActions } from '../utils';

export const types = buildActions('application', ['INIT_APP']);

const initApp = () => ({
  type: types.INIT_APP
});

export const actions = {
  initApp
};

export const initialState: AppState = {
  application: {
    inited: false
  }
};

export const reducer = (
  state: AppState = initialState,
  action: ActionObject = {}
) => {
  switch (action.type) {
    case types.INIT_APP:
      return {
        ...state,
        application: {
          ...state.application,
          inited: true
        }
      };
    default:
      return state;
  }
};

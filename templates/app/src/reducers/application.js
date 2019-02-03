import { buildActions } from 'utils';

export const types = buildActions('application', [
  'INIT_APP'
]);

const initApp = () => ({
  type: types.INIT_APP
});

export const actions = {
  initApp
};

export const initialState = {};

export const reducer = (state = initialState, action = {}) => {
  switch (action.type) {
    default:
      return state;
  }
}

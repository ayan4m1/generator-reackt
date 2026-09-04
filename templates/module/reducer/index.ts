<% const depth = directoryMode === 'dir' ? '../../' : '../'; -%>
<% const name = module.name.charAt(0).toUpperCase() + module.name.slice(1); -%>
import { ActionObject, <%= name %>State } from '<%= depth %>types';
import { buildActions } from '<%= depth %>utils';

export const types = buildActions('<%= module.name %>', ['INIT_APP']);

const initApp = () => ({
  type: types.INIT_APP
});

export const actions = {
  initApp
};

export const initialState: <%= name %>State = {};

export const reducer = (
  state: <%= name %>State = initialState,
  action: ActionObject = {}
) => {
  switch (action.type) {
    default:
      return state;
  }
};

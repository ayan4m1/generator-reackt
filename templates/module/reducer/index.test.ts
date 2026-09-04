<% const modulePath = directoryMode === 'dir' ? './index' : './' + module.name; -%>
import { actions, initialState, reducer, types } from '<%= modulePath %>';

describe('<%= module.name %> reducer', () => {
  it('has a namespaced INIT_APP action', () => {
    expect(types.INIT_APP).toBe('<%= module.name %>/INIT_APP');
    expect(actions.initApp()).toEqual({ type: types.INIT_APP });
  });

  it('returns the initial state for an unknown action', () => {
    expect(reducer(undefined, { type: 'UNKNOWN' })).toBe(initialState);
  });
});

import { getApplication } from './application';

describe('application selectors', () => {
  const state = {
    application: {
      test: true
    }
  };

  it('can getApplication', () => {
    expect(getApplication(state)).toBe(state.application);
  });
});

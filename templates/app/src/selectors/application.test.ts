import { AppState } from '../types';
import { getApplication, getApplicationInited } from './application';

describe('application selectors', () => {
  const state: AppState = {
    application: {
      inited: false
    }
  };

  it('can getApplication', () => {
    expect(getApplication(state)).toBe(state.application);
  });

  it('can getApplicationInited', () => {
    expect(getApplicationInited(state).toBe(state.application.inited));
  });
});

<% const modulePath = directoryMode === 'dir' ? './index' : './' + module.name; -%>
import { all } from 'redux-saga/effects';

import saga, { watchers } from '<%= modulePath %>';

describe('<%= module.name %> saga', () => {
  it('yields all of its watchers', () => {
    const iterator = saga();

    expect(iterator.next().value).toEqual(all(Object.values(watchers)));
    expect(iterator.next().done).toBe(true);
  });
});

<% const depth = directoryMode === 'dir' ? '../../' : '../'; -%>
<% const modulePath = directoryMode === 'dir' ? './index' : './' + module.name; -%>
<% const name = module.name.charAt(0).toUpperCase() + module.name.slice(1); -%>
import { AppState } from '<%= depth %>types';
import { get<%= name %> } from '<%= modulePath %>';

describe('<%= module.name %> selectors', () => {
  const state = { <%= module.name %>: {} } as unknown as AppState;

  it('can get<%= name %>', () => {
    expect(get<%= name %>(state)).toBe(state.<%= module.name %>);
  });
});

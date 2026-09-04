<% const depth = directoryMode === 'dir' ? '../../' : '../'; -%>
<% const name = module.name.charAt(0).toUpperCase() + module.name.slice(1); -%>
import { AppState } from '<%= depth %>types';

export const get<%= name %> = (state: AppState) => state.<%= module.name %>;

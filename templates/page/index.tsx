<% if (flags.addRedux) { %>
import { connect } from 'react-redux';
<% } %>

function <%= page.name %>() {
  return <h1><%= page.name %></h1>;
}

<% if (flags.addRedux) { %>
// react-router lazy() route modules load the named Component export
export const Component = connect(null, null)(<%= page.name %>);
<% } else { %>
// react-router lazy() route modules load the named Component export
export const Component = <%= page.name %>;
<% } %>

export default Component;

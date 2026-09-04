<% if (flags.addRedux) { %>
import { connect } from 'react-redux';
<% } %>

function <%= component.name %>() {
  return <h1><%= component.name %></h1>;
}

<% if (flags.addRedux) { %>
export default connect(null, null)(<%= component.name %>);
<% } else { %>
export default <%= component.name %>;
<% } %>

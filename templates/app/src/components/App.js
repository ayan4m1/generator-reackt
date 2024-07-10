<% if (flags.addRedux) { %>
import { connect } from 'react-redux';
<% } %>

export <% if (!flags.addRedux) { %> default <% } %> function App() {
  return <h1>Hello World</h1>;
}

<% if (flags.addRedux) { %>
export default connect(
  null,
  null
)(App);
<% } %>

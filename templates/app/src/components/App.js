import React, { Component } from 'react';
<% if (flags.addRedux) { %>
import { connect } from 'react-redux';
<% } %>

export class App extends Component {
  render() {
    return (
      <h1>Hello World</h1>
    );
  }
}

<% if (flags.addRedux) { %>
export default connect(null, null)(App);
<% } else { %>
export default App;
<% } %>

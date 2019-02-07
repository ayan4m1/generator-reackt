import React, { Component } from 'react';
<% if (flags.addRedux) { %>
import { connect } from 'react-redux';
<% } %>

export class <%= component.name %> extends Component {
  render() {
    return <h1>Hello World</h1>;
  }
}

<% if (flags.addRedux) { %>
export default connect(
  null,
  null
)(<%= component.name %>);
<% } else { %>
export default <%= component.name %>;
<% } %>

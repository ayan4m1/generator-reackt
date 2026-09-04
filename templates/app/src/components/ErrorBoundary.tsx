import { Fragment } from 'react';
<% if (styleFramework === 'bootstrap') { %>
import { Container } from 'react-bootstrap';
<% } else if (styleFramework === 'foundation') { %>
import { GridContainer as Container } from 'react-foundation';
<% } else if (styleFramework === 'materialize') { %>
import { Container } from 'react-materialize';
<% } else if (styleFramework === 'uikit') { %>
import { Container } from 'uikit-react';
<% } else if (styleFramework === 'materialUi') { %>
import { Container } from '@mui/material';
<% } %>
import { isRouteErrorResponse, useRouteError } from 'react-router';

export default function ErrorBoundary() {
  const error = useRouteError();

  return (
<% if (styleFramework === 'bulma') { %>
    <div className="container">
<% } else if (styleFramework) { %>
    <Container>
<% } else { %>
    <div>
<% } %>
      <h1>Error</h1>
      {isRouteErrorResponse(error) ? (
        <h1>
          {error.status} {error.statusText}
        </h1>
      ) : error instanceof Error ? (
        <Fragment>
          <h1>{error.message}</h1>
          <pre>{error.stack}</pre>
        </Fragment>
      ) : (
        <h1>{error as string}</h1>
      )}
<% if (styleFramework && styleFramework !== 'bulma') { %>
    </Container>
<% } else { %>
    </div>
<% } %>
  );
}

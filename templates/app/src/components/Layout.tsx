<% if (styleFramework === 'bootstrap') { %>
import { Fragment } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGamepad } from '@fortawesome/free-solid-svg-icons';

export default function Layout() {
  return (
    <Fragment>
      <Navbar expand="lg" variant="dark">
        <Container>
          <Navbar.Brand>
            <Nav.Link as={Link} to="/">
              app
            </Nav.Link>
          </Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse>
            <Nav></Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container className="h-100">
        <Outlet />
      </Container>
    </Fragment>
  );
}
<% } else { %>
import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <Outlet />
    </div>
  );
}
<% } %>
<% if (styleFramework === 'bootstrap') { %>
import { Fragment } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Container, Nav, Navbar } from 'react-bootstrap';

export default function Layout() {
  return (
    <Fragment>
      <Navbar expand="lg" variant="dark">
        <Container>
          <Navbar.Brand>
            <Nav.Link as={Link} to="/">
              <%= package.name %>
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
<% } else if (styleFramework === 'bulma') { %>
import { Link, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="container">
      <nav aria-label="main navigation" className="navbar" role="navigation">
        <div className="navbar-brand">
          <Link className="navbar-item" to="/">
            <%= package.name %>
          </Link>
        </div>
      </nav>
      <Outlet />
    </div>
  );
}
<% } else if (styleFramework === 'foundation') { %>
import { Link, Outlet } from 'react-router-dom';
import {
  GridContainer,
  Menu,
  MenuItem,
  TopBar,
  TopBarLeft
} from 'react-foundation';

export default function Layout() {
  return (
    <GridContainer>
      <TopBar>
        <TopBarLeft>
          <Menu>
            <MenuItem>
              <Link to="/"><%= package.name %></Link>
            </MenuItem>
          </Menu>
        </TopBarLeft>
      </TopBar>
      <Outlet />
    </GridContainer>
  );
}
<% } else if (styleFramework === 'materialize') { %>
import { Link, Outlet } from 'react-router-dom';
import { Container, Icon, Navbar } from 'react-materialize';

export default function Layout() {
  return (
    <Container>
      <Navbar
        brand={<Link to="/"><%= package.name %></Link>}
        menuIcon={<Icon>menu</Icon>}
      />
      <Outlet />
    </Container>
  );
}
<% } else if (styleFramework === 'uikit') { %>
import { Link, Outlet } from 'react-router-dom';
import { Container, ListItem, Navbar, NavbarContainer } from 'uikit-react';

export default function Layout() {
  return (
    <Container>
      <NavbarContainer>
        <Navbar left>
          <ListItem>
            <Link to="/"><%= package.name %></Link>
          </ListItem>
        </Navbar>
      </NavbarContainer>
      <Outlet />
    </Container>
  );
}
<% } else if (styleFramework === 'materialUi') { %>
import { Fragment } from 'react';
import { Link, Outlet } from 'react-router-dom';
import {
  AppBar,
  Container,
  CssBaseline,
  Toolbar,
  Typography
} from '@mui/material';

export default function Layout() {
  return (
    <Fragment>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography component={Link} to="/" variant="h6">
            <%= package.name %>
          </Typography>
        </Toolbar>
      </AppBar>
      <Container>
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
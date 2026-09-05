<% if (styleFramework === 'bootstrap') { %>
import { Fragment } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Container, Nav, Navbar } from 'react-bootstrap';

import { routes } from '../routes';

// only titled routes get a nav entry - the index route is reachable via the brand
const navRoutes = routes.filter((route) => route.path && route.handle?.title);

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
            <Nav>
              {navRoutes.map((route) => (
                <Nav.Link as={Link} key={route.path} to={`/${route.path}`}>
                  {route.handle?.title}
                </Nav.Link>
              ))}
            </Nav>
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

import { routes } from '../routes';

// only titled routes get a nav entry - the index route is reachable via the brand
const navRoutes = routes.filter((route) => route.path && route.handle?.title);

export default function Layout() {
  return (
    <div className="container">
      <nav aria-label="main navigation" className="navbar" role="navigation">
        <div className="navbar-brand">
          <Link className="navbar-item" to="/">
            <%= package.name %>
          </Link>
        </div>
        <div className="navbar-menu">
          <div className="navbar-start">
            {navRoutes.map((route) => (
              <Link className="navbar-item" key={route.path} to={`/${route.path}`}>
                {route.handle?.title}
              </Link>
            ))}
          </div>
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

import { routes } from '../routes';

// only titled routes get a nav entry - the index route is reachable via the brand
const navRoutes = routes.filter((route) => route.path && route.handle?.title);

export default function Layout() {
  return (
    <GridContainer>
      <TopBar>
        <TopBarLeft>
          <Menu>
            <MenuItem>
              <Link to="/"><%= package.name %></Link>
            </MenuItem>
            {navRoutes.map((route) => (
              <MenuItem key={route.path}>
                <Link to={`/${route.path}`}>{route.handle?.title}</Link>
              </MenuItem>
            ))}
          </Menu>
        </TopBarLeft>
      </TopBar>
      <Outlet />
    </GridContainer>
  );
}
<% } else if (styleFramework === 'materialize') { %>
import { Link, Outlet } from 'react-router-dom';
import { Container, Icon, Navbar, NavItem } from 'react-materialize';

import { routes } from '../routes';

// only titled routes get a nav entry - the index route is reachable via the brand
const navRoutes = routes.filter((route) => route.path && route.handle?.title);

export default function Layout() {
  return (
    <Container>
      <Navbar
        brand={<Link to="/"><%= package.name %></Link>}
        menuIcon={<Icon>menu</Icon>}
      >
        {navRoutes.map((route) => (
          <NavItem key={route.path}>
            <Link to={`/${route.path}`}>{route.handle?.title}</Link>
          </NavItem>
        ))}
      </Navbar>
      <Outlet />
    </Container>
  );
}
<% } else if (styleFramework === 'uikit') { %>
import { Link, Outlet } from 'react-router-dom';
import { Container, ListItem, Navbar, NavbarContainer } from 'uikit-react';

import { routes } from '../routes';

// only titled routes get a nav entry - the index route is reachable via the brand
const navRoutes = routes.filter((route) => route.path && route.handle?.title);

export default function Layout() {
  return (
    <Container>
      <NavbarContainer>
        <Navbar left>
          <ListItem>
            <Link to="/"><%= package.name %></Link>
          </ListItem>
          {navRoutes.map((route) => (
            <ListItem key={route.path}>
              <Link to={`/${route.path}`}>{route.handle?.title}</Link>
            </ListItem>
          ))}
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

import { routes } from '../routes';

// only titled routes get a nav entry - the index route is reachable via the brand
const navRoutes = routes.filter((route) => route.path && route.handle?.title);

export default function Layout() {
  return (
    <Fragment>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography component={Link} to="/" variant="h6">
            <%= package.name %>
          </Typography>
          {navRoutes.map((route) => (
            <Typography
              component={Link}
              key={route.path}
              to={`/${route.path}`}
              variant="body1"
            >
              {route.handle?.title}
            </Typography>
          ))}
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

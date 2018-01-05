import React from 'react';
import { Navbar, Nav, NavItem, } from 'react-bootstrap';
import { NavLink, } from 'react-router-dom';
import { LinkContainer, } from 'react-router-bootstrap';

import './Navigation.css';

const Navigation = () => {
  return (
    <Navbar>
      <Navbar.Header>
        <Navbar.Brand>
          <NavLink to='/'>kubernaut</NavLink>
        </Navbar.Brand>
      </Navbar.Header>
      <Nav>
        <LinkContainer to="/namespaces">
          <NavItem eventKey={1}>Namespaces</NavItem>
        </LinkContainer>
        <LinkContainer to="/releases">
          <NavItem eventKey={2}>Releases</NavItem>
        </LinkContainer>
        <LinkContainer to="/deployments">
          <NavItem eventKey={3}>Deployments</NavItem>
        </LinkContainer>
      </Nav>
    </Navbar>
  );
};

export default Navigation;

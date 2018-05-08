import React from 'react';
import { Navbar, Nav, NavItem } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';

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
        <LinkContainer to="/registries">
          <NavItem eventKey={1}>Registries</NavItem>
        </LinkContainer>
        <LinkContainer to="/namespaces">
          <NavItem eventKey={2}>Namespaces</NavItem>
        </LinkContainer>
        <LinkContainer to="/accounts">
          <NavItem eventKey={3}>Accounts</NavItem>
        </LinkContainer>
        <LinkContainer to="/releases">
          <NavItem eventKey={4}>Releases</NavItem>
        </LinkContainer>
        <LinkContainer to="/deployments">
          <NavItem eventKey={5}>Deployments</NavItem>
        </LinkContainer>
      </Nav>
    </Navbar>
  );
};

export default Navigation;

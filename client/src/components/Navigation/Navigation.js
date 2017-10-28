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
        <LinkContainer to="/releases">
          <NavItem eventKey={1}>Releases</NavItem>
        </LinkContainer>
      </Nav>
    </Navbar>
  );
};

export default Navigation;

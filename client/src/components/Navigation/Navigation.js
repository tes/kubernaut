import React, { Component } from 'react';
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
} from 'reactstrap';
import { LinkContainer } from 'react-router-bootstrap';

import './Navigation.css';


class Navigation extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      isOpen: false
    };
  }
  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  render() {
    return (
      <Navbar color="dark" dark expand="md" className="p-0 pl-1">
        <NavbarToggler onClick={this.toggle} />
        <Collapse isOpen={this.state.isOpen} navbar className="justify-content-center">
          <NavbarBrand href="/">kubernaut</NavbarBrand>
          <Nav className="" navbar>
            <NavItem tag={LinkContainer} to="/services">
              <NavLink>Services</NavLink>
            </NavItem>
            <NavItem tag={LinkContainer} to="/deployments">
              <NavLink>Deployments</NavLink>
            </NavItem>
            <NavItem tag={LinkContainer} to="/releases">
              <NavLink>Releases</NavLink>
            </NavItem>
            <NavItem tag={LinkContainer} to="/namespaces">
              <NavLink>Namespaces</NavLink>
            </NavItem>
            <NavItem tag={LinkContainer} to="/registries">
              <NavLink>Registries</NavLink>
            </NavItem>
            <NavItem tag={LinkContainer} to="/accounts">
              <NavLink>Accounts</NavLink>
            </NavItem>
          </Nav>
        </Collapse>
      </Navbar>
    );
  }
}

export default Navigation;

import React, { Component } from 'react';
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  Badge,
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
          <NavbarBrand
            tag={LinkContainer}
            to="/"
          ><NavLink>kubernaut</NavLink></NavbarBrand>
          <Nav className="" navbar>
            <NavItem tag={LinkContainer} to="/services">
              <NavLink>Services</NavLink>
            </NavItem>
            <NavItem tag={LinkContainer} to="/deployments">
              <NavLink>Deployments</NavLink>
            </NavItem>
            {
              this.props.account.permissions['jobs-read'] ? (
                <NavItem tag={LinkContainer} to="/cronjobs">
                  <NavLink>CronJobs <Badge color="danger" pill>alpha</Badge></NavLink>
                </NavItem>
              ) : null
            }
            <NavItem tag={LinkContainer} to="/releases">
              <NavLink>Releases</NavLink>
            </NavItem>
            <NavItem tag={LinkContainer} to="/namespaces">
              <NavLink>Namespaces</NavLink>
            </NavItem>
            <NavItem tag={LinkContainer} to="/teams">
              <NavLink>Teams</NavLink>
            </NavItem>
            <NavItem tag={LinkContainer} to="/accounts">
              <NavLink>Accounts</NavLink>
            </NavItem>
            {
              this.props.account.permissions['audit-read'] ? (
                <NavItem tag={LinkContainer} to="/admin/audit">
                  <NavLink>Audit</NavLink>
                </NavItem>
              ) : null
            }
          </Nav>
        </Collapse>
      </Navbar>
    );
  }
}

export default Navigation;

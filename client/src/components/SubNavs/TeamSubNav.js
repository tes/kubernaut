import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Nav, NavItem, NavLink } from 'reactstrap';
import {
  TeamLink,
} from '../Links';

class TeamSubNav extends Component {
  render() {
    const {
      team,
    } = this.props;

    return (
      <Row className="mb-1">
        <Col>
          <Nav tabs>
            <NavItem>
              <TeamLink container team={team}>
                <NavLink><i className="fa fa-users" aria-hidden='true'></i> {`${team.name}`}</NavLink>
              </TeamLink>
            </NavItem>
            </Nav>
          </Col>
        </Row>
    );
  }
}

TeamSubNav.propTypes = {
  team: PropTypes.object.isRequired,
};

export default TeamSubNav;

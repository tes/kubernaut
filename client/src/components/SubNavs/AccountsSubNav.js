import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Nav, NavItem, NavLink } from 'reactstrap';
import {
  AccountLink,
  EditAccountLink,
  AccountMembershipLink,
} from '../Links';

class AccountsSubNav extends Component {
  render() {
    const {
      account,
      canEdit,
      canManageTeam,
    } = this.props;

    return (
      <Row className="mb-1">
        <Col>
          <Nav tabs>
            <NavItem>
              <AccountLink container account={account}>
                <NavLink>{`${account.displayName}`}</NavLink>
              </AccountLink>
            </NavItem>
            { canEdit ?
              <NavItem>
                <EditAccountLink container account={account}>
                  <NavLink>Edit</NavLink>
                </EditAccountLink>
              </NavItem>
              : null }
            { canManageTeam ?
              <NavItem>
                <AccountMembershipLink container account={account}>
                  <NavLink><i className="fa fa-users" aria-hidden='true'></i> Team Membership</NavLink>
                </AccountMembershipLink>
              </NavItem>
              : null }
            </Nav>
          </Col>
        </Row>
    );
  }
}

AccountsSubNav.propTypes = {
  account: PropTypes.object.isRequired,
  canEdit: PropTypes.bool,
  canManageTeam: PropTypes.bool,
};

export default AccountsSubNav;

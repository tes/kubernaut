import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Nav, NavItem, NavLink } from 'reactstrap';
import {
  NamespaceLink,
  NamespacePill,
  ManageNamespaceLink,
  EditNamespaceLink,
} from '../Links';

class NamespacesSubNav extends Component {
  render() {
    const {
      namespace,
      canEdit,
      canManage,
    } = this.props;

    return (
      <Row className="mb-1">
        <Col>
          <Nav tabs>
            <NavItem>
              <NamespaceLink container namespace={namespace}>
                <NavLink><NamespacePill namespace={namespace}/></NavLink>
              </NamespaceLink>
            </NavItem>
            { canManage ?
              <NavItem>
                <ManageNamespaceLink container namespace={namespace}>
                  <NavLink>Manage</NavLink>
                </ManageNamespaceLink>
              </NavItem>
              : null }
            { canEdit ?
              <NavItem>
                <EditNamespaceLink container namespace={namespace}>
                  <NavLink>Edit</NavLink>
                </EditNamespaceLink>
              </NavItem>
              : null }
            </Nav>
          </Col>
        </Row>
    );
  }
}

NamespacesSubNav.propTypes = {
  namespace: PropTypes.object.isRequired,
  canEdit: PropTypes.bool,
  canManage: PropTypes.bool,
};

export default NamespacesSubNav;

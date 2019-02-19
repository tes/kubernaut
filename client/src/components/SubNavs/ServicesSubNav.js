import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Nav, NavItem, NavLink } from 'reactstrap';
import {
  ServiceLink,
  ManageServiceLink,
  ServiceSecretsForNamespaceLink,
  NamespacePill,
} from '../Links';

class ServicesSubNav extends Component {
  render() {
    const {
      registryName,
      serviceName,
      canManage,
      namespace,
      secrets
    } = this.props;

    return (
      <Row className="mb-1">
        <Col>
          <Nav tabs>
            <NavItem>
              <ServiceLink container registryName={registryName} serviceName={serviceName}>
                <NavLink>{`${registryName}/${serviceName}`}</NavLink>
              </ServiceLink>
            </NavItem>
            { canManage ?
              <NavItem>
                <ManageServiceLink container registryName={registryName} serviceName={serviceName}>
                  <NavLink>Manage</NavLink>
                </ManageServiceLink>
              </NavItem>
              : null }
            { canManage && namespace && secrets ?
              <NavItem>
                <ServiceSecretsForNamespaceLink
                  container
                  registryName={registryName}
                  serviceName={serviceName}
                  namespace={namespace}
                >
                  <NavLink><NamespacePill namespace={namespace}/> secrets</NavLink>
                </ServiceSecretsForNamespaceLink>
              </NavItem>
              : null }
            </Nav>
          </Col>
        </Row>
    );
  }
}

ServicesSubNav.propTypes = {
  registryName: PropTypes.string.isRequired,
  serviceName: PropTypes.string.isRequired,
  canManage: PropTypes.bool,
  namespace: PropTypes.object,
  secrets: PropTypes.bool,
};

export default ServicesSubNav;

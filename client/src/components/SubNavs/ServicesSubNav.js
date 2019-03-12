import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Nav, NavItem, NavLink } from 'reactstrap';
import {
  ServiceLink,
  ManageServiceLink,
  ServiceSecretsForNamespaceLink,
  NamespacePill,
  SecretVersionLink,
  NewSecretVersionLink,
  ServiceAttributesForNamespaceLink,
} from '../Links';

class ServicesSubNav extends Component {
  render() {
    const {
      registryName,
      serviceName,
      canManage,
      namespace,
      secrets,
      version,
      newVersion,
      attributes,
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
                  <NavLink><NamespacePill namespace={namespace}/> <i className="fa fa-key" aria-hidden='true'></i> secrets</NavLink>
                </ServiceSecretsForNamespaceLink>
              </NavItem>
              : null }
            {
              canManage && version ?
              <NavItem>
                <SecretVersionLink
                  container
                  secretVersion={version}
                >
                  <NavLink>{version.comment.length < 10 ? version.comment : `${version.comment.substring(0,7)}...`}</NavLink>
                </SecretVersionLink>
              </NavItem>
              : null }
            {
              canManage && newVersion ?
              <NavItem>
                <NewSecretVersionLink
                  container
                  registryName={registryName}
                  serviceName={serviceName}
                  namespace={namespace}
                >
                  <NavLink><i className="fa fa-key" aria-hidden='true'></i> New version</NavLink>
                </NewSecretVersionLink>
              </NavItem>
              : null }
            {
              canManage && attributes ?
              <NavItem>
                <ServiceAttributesForNamespaceLink
                  container
                  registryName={registryName}
                  serviceName={serviceName}
                  namespace={namespace}
                >
                  <NavLink><NamespacePill namespace={namespace}/> <i className="fa fa-tags" aria-hidden='true'></i> Attributes</NavLink>
                </ServiceAttributesForNamespaceLink>
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
  version: PropTypes.object,
  newVersion: PropTypes.bool,
};

export default ServicesSubNav;

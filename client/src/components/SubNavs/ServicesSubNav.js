import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Nav, NavItem, NavLink } from 'reactstrap';
import {
  ServiceLink,
  ServiceStatusLink,
  ManageServiceLink,
  ServiceSecretsForNamespaceLink,
  NamespacePill,
  SecretVersionLink,
  NewSecretVersionLink,
  ServiceAttributesForNamespaceLink,
  TeamLink,
  CreateDeploymentLink,
  IngressVersionsLink,
  NewIngressVersionLink,
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
      team,
      deploy,
      release = '',
      newIngress,
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
            <NavItem>
              <ServiceStatusLink container registryName={registryName} serviceName={serviceName}>
                <NavLink>Status</NavLink>
              </ServiceStatusLink>
            </NavItem>
            { canManage ?
              <NavItem>
                <ManageServiceLink container registryName={registryName} serviceName={serviceName}>
                  <NavLink>Manage</NavLink>
                </ManageServiceLink>
              </NavItem>
            : null }
            { deploy ?
              <NavItem>
                <CreateDeploymentLink
                  container
                  registry={{ name: registryName }}
                  service={{ name: serviceName }}
                  version={release}
                >
                  <NavLink><i className="fa fa-cloud-upload" aria-hidden='true'></i> Deploy {release}</NavLink>
                </CreateDeploymentLink>
              </NavItem>
            : null }
            { canManage && namespace && secrets ?
              <NavItem className="bread-nav">
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
              <NavItem className="bread-nav">
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
              <NavItem className="bread-nav">
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
              <NavItem className="bread-nav">
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

            <NavItem>
              <IngressVersionsLink
                container
                registryName={registryName}
                serviceName={serviceName}
              >
                <NavLink><i className="fa fa-sign-in" aria-hidden='true'></i> Ingress</NavLink>
              </IngressVersionsLink>
            </NavItem>

            {
              newIngress ?
              <NavItem className="bread-nav">
                <NewIngressVersionLink
                  container
                  registryName={registryName}
                  serviceName={serviceName}
                >
                  <NavLink>New version</NavLink>
                </NewIngressVersionLink>
              </NavItem>
            : null }


            {
              team && team.name ?
              <NavItem className="ml-auto">
                <TeamLink container team={team}>
                  <NavLink><i className="fa fa-users" aria-hidden='true'></i> {team.name}</NavLink>
                </TeamLink>
              </NavItem>
              : null
            }
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

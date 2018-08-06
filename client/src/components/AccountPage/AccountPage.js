import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Container, Row, Col, Progress, Button } from 'reactstrap';
import { EditAccountLink } from '../Links';
import Account from '../../lib/domain/Account';

class AccountPage extends Component {
  componentDidMount() {
    this.props.fetchAccountInfo({ accountId: this.props.accountId });
  }

  render() {
    const { meta, account: accountData } = this.props;
    if (meta.loading.loadingPercent !== 100) return (
      <Container>
        <Row className="d-flex justify-content-center">
          <Col sm="12" className="mt-5">
            <Progress animated color="info" value={meta.loading.loadingPercent} />
          </Col>
        </Row>
      </Container>
    );

    const account = new Account(accountData);
    const registryIds = account.listRegistryIdsWithRole();
    const registries = Object.keys(registryIds).reduce((acc, registry) => {
      acc.push({ name: registry, roles: registryIds[registry] });
      return acc;
    }, []);

    const namespaceIds = account.listNamespaceIdsWithRole();
    const namespaces = Object.keys(namespaceIds).reduce((acc, namespace) => {
      acc.push({ name: namespace, roles: namespaceIds[namespace] });
      return acc;
    }, []);

    const registryEls = [];
    let hasUnknownRegistries = false;
    registries.forEach(({ name, roles }) => {
      const registry = this.props.registries.items.find(({ id }) => (id === name));
      if (!registry) {
        hasUnknownRegistries = true;
        return;
      }
      const registryName = registry.name;
      registryEls.push(<dt key={name} className="col-sm-3">{registryName}</dt>);
      registryEls.push(<dd key={`${name}-roles`} className="col-sm-9">{roles.join(', ')}</dd>);
    });

    const namespaceEls = [];
    let hasUnknownNamespaces = false;
    namespaces.forEach(({ name, roles }) => {
      const namespace = this.props.namespaces.items.find(({ id }) => (id === name));
      if (!namespace) {
        hasUnknownNamespaces = true;
        return;
      }
      const namespaceName = `${namespace.cluster.name}/${namespace.name}`;
      namespaceEls.push(<dt key={name} className="col-sm-3">{namespaceName}</dt>);
      namespaceEls.push(<dd key={`${name}-roles`} className="col-sm-9">{roles.join(', ')}</dd>);
    });

    return (
      <Container>
        <Row className="mt-3">
            <h4>{account.displayName}</h4>
            { this.props.canEdit ?
              <EditAccountLink accountId={this.props.accountId}>
                <Button color="link">edit</Button>
              </EditAccountLink>
             : null }
        </Row>
        <Row>
            <p><strong>Created:</strong> {account.createdOn}</p>
        </Row>
        <Row className="mt-3">
          <Col sm="12">
            <h5>Namespaces:</h5>
              <dl className="row">
                {namespaceEls}
              </dl>
              {
                hasUnknownNamespaces ?
                <Row>
                  <Col sm="12">
                    <p><small>This user has access to namespaces you are not permitted to view.</small></p>
                  </Col>
                </Row>
                : null
              }
          </Col>
        </Row>
        <Row className="mt-3">
          <Col sm="12">
            <h5>Registries:</h5>
            <dl className="row">
              {registryEls}
            </dl>
            {
              hasUnknownRegistries ?
              <Row>
                <Col sm="12">
                  <p><small>This user has access to registries you are not permitted to view.</small></p>
                </Col>
              </Row>
              : null
            }
          </Col>
        </Row>
      </Container>
    );
  }
}

AccountPage.propTypes = {
  accountId: PropTypes.string.isRequired,
  account: PropTypes.object.isRequired,
  meta: PropTypes.object.isRequired,
};

export default AccountPage;

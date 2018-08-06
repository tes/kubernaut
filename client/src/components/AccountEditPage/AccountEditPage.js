import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Container, Row, Col, Progress, Button } from 'reactstrap';
import { EditAccountLink } from '../Links';
import AccountNamespacesRolesForm from '../AccountNamespacesRolesForm';
import Account from '../../lib/domain/Account';

class AccountEditPage extends Component {
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

    const namespaceIds = account.listNamespaceIdsWithRole();
    const namespaces = Object.keys(namespaceIds).reduce((acc, namespace) => {
      acc.push({ name: namespace, roles: namespaceIds[namespace] });
      return acc;
    }, []);

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
            <h4>Editing: {account.displayName}</h4>
        </Row>
        <Row>
            <p><strong>Created:</strong> {account.createdOn}</p>
        </Row>
        <Row className="mt-3">
          <Col sm="12">
            <h5>Registries:</h5>
          </Col>
        </Row>
        <Row className="mt-3">
          <Col sm="12">
            <h5>Namespaces:</h5>
            <AccountNamespacesRolesForm
              accountData={accountData}
              namespaces={this.props.namespaces}
            />
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
      </Container>
    );
  }
}

AccountEditPage.propTypes = {
  accountId: PropTypes.string.isRequired,
  account: PropTypes.object.isRequired,
  meta: PropTypes.object.isRequired,
};

export default AccountEditPage;

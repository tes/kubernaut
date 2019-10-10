import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Progress } from 'reactstrap';
import Title from '../Title';
import { AccountsSubNav } from '../SubNavs';

class AccountPage extends Component {

  render() {
    const { meta, account } = this.props;
    if (meta.loading.loadingPercent !== 100) return (
        <Row className="page-frame d-flex justify-content-center">
          <Col sm="12" className="mt-5">
            <Progress animated color="info" value={meta.loading.loadingPercent} />
          </Col>
        </Row>
    );


    const registryEls = [];
    account.roles.registries.forEach(({ registry, roles }) => {
      const registryName = registry.name;
      registryEls.push(<dt key={registry.id} className="col-sm-3">{registryName}</dt>);
      registryEls.push(<dd key={`${registry.id}-roles`} className="col-sm-9">{roles.join(', ')}</dd>);
    });

    const namespaceEls = [];
    account.roles.namespaces.forEach(({ namespace, roles }) => {
      const namespaceName = `${namespace.cluster.name}/${namespace.name}`;
      namespaceEls.push(<dt key={namespace.id} className="col-sm-3">{namespaceName}</dt>);
      namespaceEls.push(<dd key={`${namespace.id}-roles`} className="col-sm-9">{roles.join(', ')}</dd>);
    });

    const systemEls = [];
    account.roles.system.forEach(({ name, global = false}) => {
      systemEls.push(<li key={name}>{name}{ global ? ' (global)' : null }</li>);
    });

    return (
      <Row className="page-frame">
        <Col>
          <Title title={`Account: ${account.displayName}`} />
          <AccountsSubNav account={account} canEdit={this.props.canEdit} canManageTeam={this.props.canManageTeam} />
          <Row>
            <Col>
              <p><strong>Created:</strong> {account.createdOn}</p>
            </Col>
          </Row>
          <Row className="mt-1">
            <Col sm="12">
              <h5>System</h5>
              <ul className="list-unstyled">
                {systemEls}
              </ul>
            </Col>
          </Row>
          <Row className="mt-3">
            <Col sm="12">
              <h5>Namespaces:</h5>
              <dl className="row">
                {namespaceEls}
              </dl>
            </Col>
          </Row>
          <Row className="mt-3">
            <Col sm="12">
              <h5>Registries:</h5>
              <dl className="row">
                {registryEls}
              </dl>
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }
}

AccountPage.propTypes = {
  accountId: PropTypes.string.isRequired,
  account: PropTypes.object.isRequired,
  meta: PropTypes.object.isRequired,
};

export default AccountPage;

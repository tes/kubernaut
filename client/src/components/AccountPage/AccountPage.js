import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Container, Row, Col, Progress, Button } from 'reactstrap';
import { EditAccountLink } from '../Links';
import Title from '../Title';

class AccountPage extends Component {

  render() {
    const { meta, account } = this.props;
    if (meta.loading.loadingPercent !== 100) return (
      <Container>
        <Row className="d-flex justify-content-center">
          <Col sm="12" className="mt-5">
            <Progress animated color="info" value={meta.loading.loadingPercent} />
          </Col>
        </Row>
      </Container>
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
      <Container>
        <Title title={`Account: ${account.displayName}`} />
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
        <Row classNAme="mt-3">
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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Progress } from 'reactstrap';
import Title from '../Title';
import { AccountsSubNav } from '../SubNavs';
import AccountNamespacesRolesForm from '../AccountNamespacesRolesForm';
import AccountRegistriesRolesForm from '../AccountRegistriesRolesForm';
import AccountSystemRolesForm from '../AccountSystemRolesForm';

class AccountEditPage extends Component {

  render() {
    const {
      meta,
      account,
    } = this.props;
    if (meta.loading.loadingPercent !== 100) return (
      <Row className="page-frame d-flex justify-content-center">
        <Col sm="12" className="mt-5">
          <Progress animated color="info" value={meta.loading.loadingPercent} />
        </Col>
      </Row>
    );

    if (!this.props.canEdit) {
      return (
        <Row className="page-frame">
          <Col xs="12">
            <p>You are not authorised to view this page.</p>
          </Col>
        </Row>
      );
    }

    return (
      <Row className="page-frame">
        <Col>
          <Title title={`Edit account: ${account.displayName}`} />
          <AccountsSubNav account={account} canEdit={this.props.canEdit} />
          <Row>
            <Col>
              <p><strong>Created:</strong> {account.createdOn}</p>
            </Col>
          </Row>
          <Row className="mt-1">
            <Col sm="12">
              <h5>System Roles:</h5>
              <AccountSystemRolesForm account={account} />
            </Col>
          </Row>
          <Row className="mt-3">
            <Col sm="12">
              <h5>Namespaces:</h5>
              <AccountNamespacesRolesForm />
            </Col>
          </Row>
          <Row className="mt-3">
            <Col sm="12">
              <h5>Registries:</h5>
              <AccountRegistriesRolesForm />
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }
}

AccountEditPage.propTypes = {
  accountId: PropTypes.string.isRequired,
  account: PropTypes.object.isRequired,
  meta: PropTypes.object.isRequired,
};

export default AccountEditPage;

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Progress } from 'reactstrap';
import Title from '../Title';
import { AccountsSubNav } from '../SubNavs';

class AccountTeamPage extends Component {

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

    if (!this.props.canManageTeam) {
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
          <AccountsSubNav account={account} canEdit={this.props.canEdit} canManageTeam={this.props.canManageTeam} />
        </Col>
      </Row>
    );
  }
}

AccountTeamPage.propTypes = {
  accountId: PropTypes.string.isRequired,
  account: PropTypes.object.isRequired,
  meta: PropTypes.object.isRequired,
};

export default AccountTeamPage;

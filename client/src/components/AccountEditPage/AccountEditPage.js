import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Row,
  Col,
  Progress,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
} from 'reactstrap';
import Title from '../Title';
import {
  AccountsSubNav,
} from '../SubNavs';
import AccountTeamsRolesForm from '../AccountTeamsRolesForm';
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
          <AccountsSubNav account={account} canEdit={this.props.canEdit} canManageTeam={this.props.canManageTeam} />
          <Row>
            <Col xs={{ size: 'auto' }} className="mr-auto">
              <p><strong>Created:</strong> {account.createdOn}</p>
            </Col>
            <Col xs={{ size: 'auto' }}>
              {
                this.props.canDelete ? (
                  <Button onClick={() => this.props.openDeleteModal()} color="danger" outline>Delete account</Button>
                ) : null
              }
              {
                this.props.canDelete ? (
                  <Modal
                    isOpen={this.props.deleteModalOpen}
                    toggle={this.props.closeDeleteModal}
                    size="md"
                  >
                    <ModalHeader>
                      Delete account: {account.displayName}
                    </ModalHeader>
                    <ModalBody>
                      <Row>
                        <Col>
                          <p>Are your sure you want to delete this account?</p>
                        </Col>
                        <Col>
                          <Button onClick={() => this.props.deleteAccount({ id: account.id })} color="danger" outline>Delete</Button>
                        </Col>
                      </Row>
                    </ModalBody>
                  </Modal>
                ) : null
              }
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
              <h5>Teams:</h5>
              <AccountTeamsRolesForm />
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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field, FieldArray } from 'redux-form';
import {
  Container,
  Row,
  Col,
  Table,
  Progress,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
} from 'reactstrap';
import { ServicesSubNav } from '../SubNavs';
import Title from '../Title';
import TablePagination from '../TablePagination';
import RenderSelect from '../RenderSelect';
import { NamespaceLink, ServiceSecretsForNamespaceLink, ServiceAttributesForNamespaceLink } from '../Links';

const renderNamespaces = ({ fields, namespaces, serviceId, onUpdate, disabled, serviceName, registryName, buttonActionIsDisable = false }) => fields.map((member, index) => {
  const namespace = namespaces[index];
  if (!namespace) return null; // Strange temporal bug that this seems to fix.

  return (
    <tr key={namespace.id}>
      <td className="text-center">
        <Button
          outline
          color={buttonActionIsDisable ? 'danger' : 'secondary'}
          onClick={() => {
            onUpdate({
              namespaceId: namespace.id,
              serviceId,
              newValue: !buttonActionIsDisable,
            });
          }}
        >{buttonActionIsDisable ? 'Disable deployments' : 'Enable deployments' }</Button>
      </td>
      <td>
        <NamespaceLink namespace={namespace} pill showCluster />
      </td>
      <td>
        <ServiceSecretsForNamespaceLink
          namespace={namespace}
          registryName={registryName}
          serviceName={serviceName}
        />
      </td>
      <td>
        <ServiceAttributesForNamespaceLink
          namespace={namespace}
          registryName={registryName}
          serviceName={serviceName}
        />
      </td>
    </tr>
  );
});

class ServiceManagePage extends Component {

  render() {
    const { meta, updateTeamOwnership } = this.props;
    if (meta.loading.loadingPercent !== 100) return (
      <Container className="page-frame">
        <Row className="d-flex justify-content-center">
          <Col sm="12" className="mt-5">
            <Progress animated color="info" value={meta.loading.loadingPercent} />
          </Col>
        </Row>
      </Container>
    );

    if (!this.props.canManage) {
      return (
        <Container className="page-frame">
          <Row>
            <Col xs="12">
              <p>You are not authorised to view this page.</p>
            </Col>
          </Row>
        </Container>
      );
    }

    const error = this.props.error;
    const namespaces = this.props.namespaces;
    const serviceId = this.props.serviceId;

    return (
      <Container className="page-frame">
        <Title title={`Manage service: ${this.props.registryName}/${this.props.serviceName}`} />
        <ServicesSubNav registryName={this.props.registryName} serviceName={this.props.serviceName} canManage={this.props.canManage} team={this.props.team} />
        <Row>
          <Col md="8">
            <form>
              <Row>
                <Col>
                  <Table>
                    <thead>
                      <tr>
                        <th className="border-top-0" colSpan="4">Namespaces this service deploys to:</th>
                      </tr>
                    </thead>
                    <tbody>
                      <FieldArray
                        name="deployable"
                        component={renderNamespaces}
                        namespaces={namespaces.deployable}
                        serviceId={serviceId}
                        onUpdate={this.props.updateServiceStatusForNamespace}
                        disabled={this.props.submitting}
                        registryName={this.props.registryName}
                        serviceName={this.props.serviceName}
                        buttonActionIsDisable
                      />
                    </tbody>
                  </Table>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Table>
                    <thead>
                      <tr>
                        <th className="border-top-0" colSpan="4">Namespaces this service does not deploy to:</th>
                      </tr>
                    </thead>
                    <tbody>
                      <FieldArray
                        name="namespaces"
                        component={renderNamespaces}
                        namespaces={namespaces.items}
                        serviceId={serviceId}
                        onUpdate={this.props.updateServiceStatusForNamespace}
                        disabled={this.props.submitting}
                        registryName={this.props.registryName}
                        serviceName={this.props.serviceName}
                      />
                    </tbody>
                  </Table>
                </Col>
              </Row>
              <Row>
                <Col sm="12">
                  {error && <span className="help-block"><span className="text-danger">{error}</span></span>}
                </Col>
              </Row>
            </form>
            <Row>
              <Col>
                <TablePagination
                  pages={namespaces.pages}
                  page={namespaces.page}
                  limit={namespaces.limit}
                  fetchContent={({ page, limit }) => {
                    this.props.fetchNamespacesPagination({
                      page,
                      limit,
                    });
                  }}
                  />
              </Col>
            </Row>
          </Col>
          <Col md="4">
            { this.props.canManageTeamForService ? (
              <Row>
                <Col>
                  <Row>
                    <Col>
                      <h6>Team ownership:</h6>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Field
                        name="team"
                        className="form-control"
                        component={RenderSelect}
                        options={this.props.manageableTeams.map(t => ({ value: t.id, display: t.name }))}
                        onChange={(evt, newValue) => updateTeamOwnership({ value: newValue }) }
                        />
                    </Col>
                  </Row>
                </Col>
              </Row>
            ) : null}
            { this.props.canDelete && this.props.canManageTeamForService ? (
              <hr />
            ) : null }
            { this.props.canDelete ? (
              <Row>
                <Col className="d-flex">
                  <Button className="ml-auto" onClick={() => this.props.openDeleteModal()} color="danger" outline>Delete Service</Button>
                </Col>
              </Row>
            ) : null }
            { this.props.canDelete ? (
              <Modal
                isOpen={this.props.deleteModalOpen}
                toggle={this.props.closeDeleteModal}
                size="lg"
              >
                <ModalHeader>
                  Delete Service
                </ModalHeader>
                <ModalBody>
                  <Row>
                    <Col>
                      <p>Please note: <strong>This does not remove the service from the environment(s). Please remove the service from kubernetes separately.</strong></p>
                    </Col>
                  </Row>
                  <Row>
                    <Col className="d-flex justify-content-between">
                      <p>Are you sure?</p>
                      <Button onClick={() => this.props.deleteService()} color="danger" outline>Delete</Button>
                    </Col>
                  </Row>
                </ModalBody>
              </Modal>
            ) : null }
          </Col>
        </Row>
      </Container>
    );
  }
}

ServiceManagePage.propTypes = {
  serviceName: PropTypes.string.isRequired,
  registryName: PropTypes.string.isRequired,
  serviceId: PropTypes.string.isRequired,
  canManage: PropTypes.bool.isRequired,
  team: PropTypes.object,
};

export default ServiceManagePage;

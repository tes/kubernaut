import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field, FieldArray } from 'redux-form';
import {
  Container,
  Row,
  Col,
  Table,
  Progress,
} from 'reactstrap';
import { ServicesSubNav } from '../SubNavs';
import Title from '../Title';
import TablePagination from '../TablePagination';
import RenderSelect from '../RenderSelect';
import { NamespaceLink, ServiceSecretsForNamespaceLink, ServiceAttributesForNamespaceLink } from '../Links';

const renderNamespaces = ({ fields, namespaces, serviceId, onUpdate, disabled, serviceName, registryName }) => fields.map((member, index) => {
  const status = namespaces[index];

  return (
    <tr key={status.namespace.id}>
      <td className="text-center">
        <Field
          component="input"
          type="checkbox"
          name={`${member}.canDeploy`}
          disabled={disabled}
          onChange={(event, newValue) => {
            onUpdate({
              namespaceId: status.namespace.id,
              serviceId,
              newValue,
            });
          }}
          />
      </td>
      <td>
        <NamespaceLink namespace={status.namespace} pill showCluster />
      </td>
      <td>
        <ServiceSecretsForNamespaceLink
          namespace={status.namespace}
          registryName={registryName}
          serviceName={serviceName}
        />
      </td>
      <td>
        <ServiceAttributesForNamespaceLink
          namespace={status.namespace}
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
                        <th className="text-center border-top-0">Can deploy?</th>
                        <th className="border-top-0">Namespace</th>
                        <th className="border-top-0"></th>
                        <th className="border-top-0"></th>
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

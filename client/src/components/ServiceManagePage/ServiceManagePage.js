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
import { NamespaceLink } from '../Links';

const renderNamespaces = ({ fields, namespaces, serviceId, onUpdate, disabled }) => fields.map((member, index) => {
  const status = namespaces[index];

  return (
    <tr key={status.namespace.id}>
      <td>
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
    </tr>
  );
});

class ServiceManagePage extends Component {

  render() {
    const { meta } = this.props;
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
        <ServicesSubNav registryName={this.props.registryName} serviceName={this.props.serviceName} canManage={this.props.canManage} />
        <Row>
          <Col sm="12">
            <form>
              <Row>
                <Table>
                  <thead>
                    <tr>
                      <th>Can deploy?</th>
                      <th>Namespace</th>
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
                    />
                  </tbody>
                </Table>
              </Row>
              <Row>
                <Col sm="12">
                  {error && <span className="help-block"><span className="text-danger">{error}</span></span>}
                </Col>
              </Row>
            </form>
            <Row>
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
};

export default ServiceManagePage;

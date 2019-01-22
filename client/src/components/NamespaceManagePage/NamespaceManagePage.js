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
import Title from '../Title';
import { NamespacesSubNav } from '../SubNavs';
import TablePagination from '../TablePagination';

const renderServices = ({ fields, services, namespace, onUpdate, disabled }) => fields.map((member, index) => {
  const service = services[index];
  return (
    <tr key={service.service.id}>
      <td>
        <Field
          component="input"
          type="checkbox"
          name={`${member}.enabled`}
          disabled={disabled}
          onChange={(event, newValue) => {
            onUpdate({
              namespaceId: namespace.id,
              serviceId: service.service.id,
              newValue,
            });
          }}
          />
      </td>
      <td>
        {service.service.name}
      </td>
      <td>
        {service.service.registry.name}
      </td>
    </tr>
  );
});

class NamespaceManagePage extends Component {

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
    const namespace = this.props.namespace;
    const services = this.props.services;

    return (
      <Container className="page-frame">
        <Title title={`Manage namespace: ${namespace.clusterName}/${namespace.name}`} />
        <NamespacesSubNav namespace={namespace} canEdit={this.props.canEdit} canManage={this.props.canManage} />
        <Row>
          <Col sm="12">
            <form>
              <Row>
                <Table>
                  <thead>
                    <tr>
                      <th>Can deploy?</th>
                      <th>Service</th>
                      <th>Registry</th>
                    </tr>
                  </thead>
                  <tbody>
                    <FieldArray
                      name="services"
                      component={renderServices}
                      services={services.items}
                      namespace={namespace}
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
                pages={services.pages}
                page={services.page}
                limit={services.limit}
                fetchContent={({ page, limit }) => {
                  this.props.fetchServicesPagination({
                    id: namespace.id,
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

NamespaceManagePage.propTypes = {
  namespaceId: PropTypes.string.isRequired,
  canManage: PropTypes.bool.isRequired,
  namespace: PropTypes.object.isRequired,
};

export default NamespaceManagePage;

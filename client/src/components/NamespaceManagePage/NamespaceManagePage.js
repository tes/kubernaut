import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field, FieldArray } from 'redux-form';
import {
  Badge,
  Container,
  Row,
  Col,
  Table,
  Progress,
} from 'reactstrap';
import Title from '../Title';
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
    if (!this.props.canManage) {
      return (
        <Container>
          <Row>
            <Col xs="12">
              <p>You are not authorised to view this page.</p>
            </Col>
          </Row>
        </Container>
      );
    }

    const { meta } = this.props;
    if (meta.loading.loadingPercent !== 100) return (
      <Container>
        <Row className="d-flex justify-content-center">
          <Col sm="12" className="mt-5">
            <Progress animated color="info" value={meta.loading.loadingPercent} />
          </Col>
        </Row>
      </Container>
    );

    const error = this.props.error;
    const namespace = this.props.namespace;
    const headingBadge = <Badge
        style={{ backgroundColor: namespace.color }}
        pill
      >{namespace.clusterName}/{namespace.name}
      </Badge>;

    const services = this.props.services;

    return (
      <Container>
        <Title title={`Manage namespace: ${namespace.clusterName}/${namespace.name}`} />
        <Row>
          <h4>{headingBadge}</h4>
        </Row>
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

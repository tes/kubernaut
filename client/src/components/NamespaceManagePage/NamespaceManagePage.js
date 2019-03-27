import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field, FieldArray } from 'redux-form';
import {
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
      <td className="text-center">
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
      <Row className="page-frame d-flex justify-content-center">
        <Col sm="12" className="mt-5">
          <Progress animated color="info" value={meta.loading.loadingPercent} />
        </Col>
      </Row>
    );

    if (!this.props.canManage) {
      return (
        <Row className="page-frame">
          <Col xs="12">
            <p>You are not authorised to view this page.</p>
          </Col>
        </Row>
      );
    }

    const error = this.props.error;
    const namespace = this.props.namespace;
    const services = this.props.services;

    return (
      <Row className="page-frame">
        <Col>
          <Title title={`Manage namespace: ${namespace.clusterName}/${namespace.name}`} />
          <NamespacesSubNav namespace={namespace} canEdit={this.props.canEdit} canManage={this.props.canManage} />
          <Row>
            <Col sm="8">
              <form>
                <Row>
                  <Col>
                    <Table>
                      <thead>
                        <tr>
                          <th className="border-top-0 text-center">Can deploy?</th>
                          <th className="border-top-0">Service</th>
                          <th className="border-top-0">Registry</th>
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
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }
}

NamespaceManagePage.propTypes = {
  namespaceId: PropTypes.string.isRequired,
  canManage: PropTypes.bool.isRequired,
  namespace: PropTypes.object.isRequired,
};

export default NamespaceManagePage;

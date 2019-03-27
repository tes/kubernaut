import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'reactstrap';
import Title from '../Title';
import DeploymentsTable from '../DeploymentsTable';
import { NamespacesSubNav } from '../SubNavs';

class NamespaceDetailsPage extends Component {

  render() {
    const namespace = this.props.namespace.data;

    const namespaceAttributes = [];
    for (const attribute in namespace.attributes) {
      namespaceAttributes.push(
        <dl className="d-flex mb-0" key={attribute}>
          <dt className="text-right mr-1">{attribute}:</dt>
          <dd className="flex-fill mb-0">{namespace.attributes[attribute]}</dd>
        </dl>
      );
    }

    return (
      <Row className="page-frame">
        <Col>
          <Title title={`Namespace: ${namespace.cluster.name}/${namespace.name}`}/>
          <NamespacesSubNav namespace={namespace} canEdit={this.props.canEdit} canManage={this.props.canManage} />

          <dl className="row">
            <dt className="col-md-3">Context:</dt>
            <dd className="col-md-9">{namespace.context}</dd>

            <dt className="col-md-3">Attributes:</dt>
            <dd className="col-md-9">
              {namespaceAttributes}
            </dd>
          </dl>

          <Row>
            <Col>
              <h5>Deployments for this namespace:</h5>
            </Col>
          </Row>
          <Row>
            <Col>
              <DeploymentsTable
                deployments={this.props.deployments.data}
                loading={this.props.deployments.meta.loading}
                error={this.props.deployments.meta.error}
                fetchDeployments={(options) => {
                  this.props.fetchDeploymentsPagination({
                    ...options,
                    id: this.props.namespaceId,
                  });
                }}
                sort={this.props.deployments.sort}
                toggleSort={this.props.toggleSort}
                omitColumns={['where']}
                hideFilters
                />
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }
}

NamespaceDetailsPage.propTypes = {
  namespaceId: PropTypes.string.isRequired,
  namespace: PropTypes.object.isRequired,
  deployments: PropTypes.object.isRequired,
};

export default NamespaceDetailsPage;

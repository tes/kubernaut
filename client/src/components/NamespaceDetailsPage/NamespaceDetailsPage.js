import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Badge, Row } from 'reactstrap';
import DeploymentsTable from '../DeploymentsTable';

class NamespaceDetailsPage extends Component {
  componentDidMount() {
    this.props.fetchNamespacePageData(this.props.namespaceId);
  }

  render() {
    const namespace = this.props.namespace.data;

    const namespaceAttributes = [];
    for (const attribute in namespace.attributes) {
      namespaceAttributes.push(<dt key={attribute} className="col-md-3">{attribute}:</dt>);
      namespaceAttributes.push(<dd
        key={`${attribute}-${namespace.attributes[attribute]}`}
        className="col-md-9"
      >{namespace.attributes[attribute]}
      </dd>);
    }

    const headingBadge = <Badge style={{ backgroundColor: namespace.color || namespace.cluster.color }} pill>{namespace.cluster.name}/{namespace.name}</Badge>;

    return (
      <div className="container">
        <Row>
          <h4>{headingBadge}</h4>
        </Row>

        <dl className="row">
          <dt className="col-md-3">Context:</dt>
          <dd className="col-md-9">{namespace.context}</dd>

          <dt className="col-md-3">Attributes:</dt>
          <dd className="col-md-9">
            <dl className="row">
              {namespaceAttributes}
            </dl>
          </dd>
        </dl>

        <Row>
          <h5>Deployments for this namespace:</h5>
          <DeploymentsTable
            deployments={this.props.deployments.data}
            loading={this.props.deployments.meta.loading}
            error={this.props.deployments.meta.error}
          />
        </Row>
      </div>
    );
  }
}

NamespaceDetailsPage.propTypes = {
  namespaceId: PropTypes.string.isRequired,
  namespace: PropTypes.object.isRequired,
  deployments: PropTypes.object.isRequired,
};

export default NamespaceDetailsPage;

import React, { Component } from 'react';
import { Badge } from 'reactstrap';

import PropTypes from 'prop-types';

class NamespaceDetailsPage extends Component {
  componentDidMount() {
    this.props.fetchNamespace(this.props.namespaceId);
  }

  render() {
    const namespace = this.props.namespace.data;

    const namespaceAttributes = [];
    for (const attribute in namespace.attributes) {
      namespaceAttributes.push(<dt key={attribute} className="col-md-3">{attribute}</dt>);
      namespaceAttributes.push(<dd
        key={`${attribute}-${namespace.attributes[attribute]}`}
        className="col-md-9"
      >{namespace.attributes[attribute]}
      </dd>);
    }

    const headingBadge = <Badge style={{ backgroundColor: namespace.color || namespace.cluster.color }} pill>{namespace.cluster.name}/{namespace.name}</Badge>;

    return (
      <div className="container">
        <div className="row">
          <h4>{headingBadge}</h4>
        </div>

        <dl className="row">
          <dt className="col-md-3">Context</dt>
          <dd className="col-md-9">{namespace.context}</dd>

          <dt className="col-md-3">Attributes</dt>
          <dd className="col-md-9">
            <dl className="row">
              {namespaceAttributes}
            </dl>
          </dd>
        </dl>
      </div>
    );
  }
}

NamespaceDetailsPage.propTypes = {
  namespaceId: PropTypes.string.isRequired,
};

export default NamespaceDetailsPage;

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DeploymentLink } from '../Links';

class ServiceDeploymentHistory extends Component {

  render() {
    const deployments = this.props.deployments;
    const rows = [];
    if (deployments && deployments.data && deployments.data.items) {
      deployments.data.items.forEach(item => {
        rows.push((
          <div className="row" key={item.id}>
            <div className="col-md-2">{item.createdOn}</div>
            <div className="col-md-1">{item.release.version}</div>
            <div className="col-md-2">{item.namespace.cluster.name}</div>
            <div className="col-md-1">{item.status}</div>
            <div className="col-md-2">{item.createdBy.displayName}</div>
            <div className="col-md-1"><DeploymentLink deployment={item} icon="external-link"/></div>

          </div>
        ));
      });
    }
    return (
      <div>
        {rows}
      </div>
    );
  }
}

ServiceDeploymentHistory.propTypes = {
  deployments: PropTypes.object,
};

export default ServiceDeploymentHistory;

import React, { Component, } from 'react';
import PropTypes from 'prop-types';

class DeploymentDetailsPage extends Component {

  componentDidMount() {
    this.props.fetchDeployment();
  }

  render() {
    const { meta = {}, deployment, } = this.props;

    const errorDetails = () =>
      <div>Error loading deployments</div>
    ;

    const loadingDetails = () =>
      <div>Loading deployments</div>
    ;

    const deploymentDetails = () =>
      <div className='row'>
        <div className='col-12'>
          <div>Service: {deployment.release.service.name}</div>
          <div>Version: {deployment.release.version}</div>
          <div>Namespace: {deployment.release.service.namespace.name}</div>
          <div>Created On: {deployment.createdOn}</div>
          <div>Created By: {deployment.createdBy.displayName}</div>
          <h3>Deployment Log</h3>
          {
            deployment.log.map(entry => {
              return <div key={entry.id}>
                <div>{entry.writtenOn}</div>
                <div>{entry.writtenTo}</div>
                <div>{entry.content}</div>
              </div>;
            })
          }
        </div>
      </div>
    ;

    return (() => {
      if (meta.error) return errorDetails();
      else if (meta.loading || !deployment) return loadingDetails();
      else return deploymentDetails();
    })();
  }
}

DeploymentDetailsPage.propTypes = {
  deployment: PropTypes.object,
};

export default DeploymentDetailsPage;

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ServiceReleaseHistory from '../ServiceReleaseHistory';
import ServiceDeploymentHistory from '../ServiceDeploymentHistory';

class ServiceDetailsPage extends Component {
  componentDidMount() {
    this.props.fetchReleasesForService({
      registry: this.props.registryName,
      service: this.props.serviceName,
    });

    this.props.fetchDeploymentHistoryForService({
      registry: this.props.registryName,
      service: this.props.serviceName,
    });
  }

  render() {
    return (
      <div className="container">
        <div className="row">
          <h4>{this.props.registryName}/{this.props.serviceName}</h4>
        </div>
        <div className="row mb-5 d-block">
          <h5>Releases</h5>
          <ServiceReleaseHistory releases={this.props.releasesList} />
        </div>

        <div className="row d-block">
          <h5>Deployments</h5>
          <ServiceDeploymentHistory deployments={this.props.deploymentsList} />
        </div>
      </div>
    );
  }
}

ServiceDetailsPage.propTypes = {
  registryName: PropTypes.string.isRequired,
  serviceName: PropTypes.string.isRequired,
  releasesList: PropTypes.object
};

export default ServiceDetailsPage;

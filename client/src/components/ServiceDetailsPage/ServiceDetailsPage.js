import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import Title from '../Title';
import ServiceReleaseHistory from '../ServiceReleaseHistory';
import ServiceDeploymentHistory from '../ServiceDeploymentHistory';
import { ManageServiceLink } from '../Links';

class ServiceDetailsPage extends Component {

  render() {
    return (
      <div className="container">
        <Title title={`Service: ${this.props.registryName}/${this.props.serviceName}`} />
        <div className="row">
          <h4>{this.props.registryName}/{this.props.serviceName}</h4>
            { this.props.canManage ?
              <ManageServiceLink registryName={this.props.registryName} serviceName={this.props.serviceName}>
                <Button color="link">manage</Button>
              </ManageServiceLink>
             : null }
        </div>
        <div className="row mb-3 d-block">
          <h5>Releases:</h5>
          <ServiceReleaseHistory
            releases={this.props.releasesList}
            latestDeployments={this.props.latestDeployments}
            deploymentsWithNotes={this.props.deploymentsWithNotes}
            paginationFunc={({ page, limit }) => {
              this.props.fetchReleasesPagination({
                registry: this.props.registryName,
                service: this.props.serviceName,
                page,
                limit,
              });
            }}
          />
        </div>

        <div className="row d-block">
          <h5>Deployments:</h5>
        </div>
        <ServiceDeploymentHistory
          deployments={this.props.deploymentsList}
          paginationFunc={({ page, limit }) => {
            this.props.fetchDeploymentsPagination({
              registry: this.props.registryName,
              service: this.props.serviceName,
              page,
              limit,
            });
          }}
          />
      </div>
    );
  }
}

ServiceDetailsPage.propTypes = {
  registryName: PropTypes.string.isRequired,
  serviceName: PropTypes.string.isRequired,
  releasesList: PropTypes.object,
  deploymentsList: PropTypes.object,
  latestDeployments: PropTypes.array,
  canManage: PropTypes.bool,
};

export default ServiceDetailsPage;

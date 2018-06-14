import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Card, CardBody } from 'reactstrap';
import { DeploymentLink, CreateDeploymentLink } from '../Links';

class ServiceDeploymentHistory extends Component {

  render() {
    const deployments = this.props.deployments;
    const rows = [];
    if (deployments && deployments.data && deployments.data.items) {
      deployments.data.items.forEach(item => {
        rows.push((
          <div className="row" key={item.id}>
            <Card className="col-sm">
              <CardBody className="row p-1">
                <div className="col-lg">
                  <dl className="row mb-0">
                    <dt className="col-lg-3">When:</dt>
                    <dd className="col-lg-9">{item.createdOn}</dd>
                    <dt className="col-lg-3">Version:</dt>
                    <dd className="col-lg-9">{item.release.version}</dd>
                    <dt className="col-lg-3">Where:</dt>
                    <dd className="col-lg-9">{item.namespace.cluster.name}</dd>
                    <dt className="col-lg-3">Status:</dt>
                    <dd className="col-lg-9">{item.status}</dd>
                  </dl>
                </div>
                <div className="col-lg">
                  <dl className="row mb-0">
                    <dt className="col-lg-3">Who:</dt>
                    <dd className="col-lg-9">{item.createdBy.displayName}</dd>
                    <dt className="col-lg-3">View:</dt>
                    <dd className="col-lg-9"><DeploymentLink deployment={item} icon="external-link"/></dd>
                    <dt className="col-lg-3">Actions:</dt>
                    <dd className="col-lg-9">
                      <CreateDeploymentLink
                        registry={item.release.service.registry}
                        service={item.release.service}
                        version={item.release.version}
                        cluster={item.namespace.cluster}
                        namespace={item.namespace}
                        text="Re-deploy"
                        />
                    </dd>
                  </dl>
                </div>
              </CardBody>
            </Card>

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

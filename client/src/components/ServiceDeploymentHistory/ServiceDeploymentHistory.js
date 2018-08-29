import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Card, CardBody, Row } from 'reactstrap';
import TablePagination from '../TablePagination';
import { Human } from '../DisplayDate';
import {
  DeploymentLink,
  CreateDeploymentLink,
  NamespaceLink,
  AccountLink,
} from '../Links';

class ServiceDeploymentHistory extends Component {

  render() {
    const deployments = this.props.deployments;
    const rows = [];
    if (deployments && deployments.data && deployments.data.items) {
      deployments.data.items.forEach(item => {
        rows.push((
          <Row key={item.id}>
            <Card className="col-sm mb-2">
              <CardBody className="row p-1">
                <div className="col-lg">
                  <dl className="row mb-0">
                    <dt className="col-lg-3">When:</dt>
                    <dd className="col-lg-9"><Human date={item.createdOn} /></dd>
                    <dt className="col-lg-3">Version:</dt>
                    <dd className="col-lg-9">{item.release.version}</dd>
                    <dt className="col-lg-3">Where:</dt>
                    <dd className="col-lg-9"><NamespaceLink namespace={item.namespace} pill showCluster /></dd>
                  </dl>
                </div>
                <div className="col-lg">
                  <dl className="row mb-0">
                    <dt className="col-lg-3">Status:</dt>
                    <dd className="col-lg-9">{item.status}</dd>
                    <dt className="col-lg-3">Who:</dt>
                    <dd className="col-lg-9"><AccountLink account={item.createdBy} /></dd>
                    <dt className="col-lg-3">Actions:</dt>
                    <dd className="col-lg-9">
                      <DeploymentLink
                        deployment={item}
                        icon="external-link"
                      >
                        <span className="mr-2">View</span>
                      </DeploymentLink>
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
          </Row>
        ));
      });
    }
    return (
      <div>
        {rows}
        <Row>
          <TablePagination
            pages={deployments.data.pages}
            page={deployments.data.page}
            limit={deployments.data.limit}
            fetchContent={this.props.paginationFunc}
          />
        </Row>
      </div>
    );
  }
}

ServiceDeploymentHistory.propTypes = {
  deployments: PropTypes.object,
};

export default ServiceDeploymentHistory;

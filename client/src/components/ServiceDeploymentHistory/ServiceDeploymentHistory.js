import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardBody,
  Row,
  Col,
  CardDeck,
  CardHeader,
  CardFooter,
} from 'reactstrap';
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
    const cards = [];
    if (deployments && deployments.data && deployments.data.items) {
      deployments.data.items.forEach(item => {
        cards.push((
          <Col sm="4" className="p-0">
            <Card key={item.id} className="m-1">
              <CardHeader className="d-flex justify-content-between px-2 py-1">
                <div><Human date={item.createdOn} /></div>
                <div>{item.status}</div>
              </CardHeader>
              <CardBody className="row p-1">
                <Col sm="12">
                  <dl className="row mb-0">
                    <dt className="col-lg-3">Version:</dt>
                    <dd className="col-lg-9">{item.release.version}</dd>
                    <dt className="col-lg-3">Where:</dt>
                    <dd className="col-lg-9"><NamespaceLink namespace={item.namespace} pill showCluster /></dd>
                    <dt className="col-lg-3">Who:</dt>
                    <dd className="col-lg-9"><AccountLink account={item.createdBy} /></dd>
                  </dl>
                </Col>
              </CardBody>
              <CardFooter className="d-flex justify-content-between px-2 py-1">
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
              </CardFooter>
            </Card>
          </Col>
        ));
      });
    }
    return (
      <div>
        <Row>
          <Col sm="12">
            <CardDeck>
              <Row>
                {cards}
              </Row>
            </CardDeck>
          </Col>
        </Row>
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

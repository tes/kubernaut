import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import {
  Card,
  CardBody,
  Row,
  Col,
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
          <Row key={item.id}>
            <Col sm="12" className="p-0">
              <Card className="m-1">
                <CardHeader className="d-flex justify-content-between px-2 py-1">
                  <div><Human date={item.createdOn} /></div>
                  <div>{item.status}</div>
                </CardHeader>
                <CardBody className="p-1">
                  <Row>
                    <Col sm="11" className="d-flex justify-content-around mx-auto">
                      <div className="d-flex w-100">
                        <div className="mr-1"><strong>Version:</strong></div>
                        <div>{item.release.version}</div>
                      </div>
                      <div className="d-flex w-100">
                        <div className="mr-1"><strong>Where:</strong></div>
                        <div><NamespaceLink namespace={item.namespace} pill showCluster /></div>
                      </div>
                      <div className="d-flex w-100">
                        <div className="mr-1"><strong>Who:</strong></div>
                        <div><AccountLink account={item.createdBy} /></div>
                      </div>
                    </Col>
                  </Row>
                  { item.note ? (
                    <Row className="mt-2">
                      <Col>
                        <ReactMarkdown
                          className="text-light bg-dark p-1 mx-2"
                          source={item.note}
                        />
                      </Col>
                    </Row>
                    ) : null
                  }
                </CardBody>
                <CardFooter className="d-flex justify-content-end px-2 py-1">
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
          </Row>
        ));
      });
    }
    return (
      <div>
        <Row>
          <Col sm="12">
            {cards}
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

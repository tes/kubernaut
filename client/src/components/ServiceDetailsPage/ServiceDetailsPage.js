import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Card, CardTitle, CardBody } from 'reactstrap';
import Title from '../Title';
import { ServicesSubNav } from '../SubNavs';
import ServiceReleaseHistory from '../ServiceReleaseHistory';
import ServiceDeploymentHistory from '../ServiceDeploymentHistory';
import { NamespacePill } from '../Links';

const NamespaceStatusBlobs = (props) => {
  const els = [];

  props.latestDeployments.forEach((lDep, index) => {
    els.push((
      <Card body className="py-3" style={{ flex: 'none' }} key={lDep.namespace.id}>
        <CardTitle><NamespacePill namespace={lDep.namespace} /></CardTitle>
        <CardBody className="p-0">
          <div>Version: {lDep.release.version}</div>
          <div>Restarts: {lDep.restarts}</div>
        </CardBody>
      </Card>
    ));
    if (index + 1 < props.latestDeployments.length) {
      els.push(<div key={`spacer-${lDep.namespace.id}`}className="flex-grow-1"></div>);
    }
  });

  return (
    <div className="d-flex">
      <div className="flex-grow-1"></div>
      {els}
      <div className="flex-grow-1"></div>
    </div>);
};

class ServiceDetailsPage extends Component {

  render() {
    return (
      <Row className="page-frame">
        <Col>
          <Title title={`Service: ${this.props.registryName}/${this.props.serviceName}`} />
          <ServicesSubNav
            registryName={this.props.registryName}
            serviceName={this.props.serviceName}
            canManage={this.props.canManage}
            team={this.props.team}
            canReadIngress={this.props.canReadIngress}
          />

          {
            this.props.latestDeployments.length ? (
              <Row className="mb-2">
                <Col>
                  <NamespaceStatusBlobs latestDeployments={this.props.latestDeployments} />
                </Col>
              </Row>
            ) : null
          }

          <Row>
            <Col>
              <Row>
                <Col>
                  <h5>Releases:</h5>
                </Col>
              </Row>
              <Row>
                <Col>
                  <ServiceReleaseHistory
                    releases={this.props.releasesList}
                    latestDeployments={this.props.latestDeployments}
                    deploymentsWithNotes={this.props.deploymentsWithNotes}
                    releasesNamespaceHistory={this.props.releasesNamespaceHistory}
                    paginationFunc={({ page, limit }) => {
                      this.props.fetchReleasesPagination({
                        registry: this.props.registryName,
                        service: this.props.serviceName,
                        page,
                        limit,
                      });
                    }}
                    />
                </Col>
              </Row>
            </Col>
          </Row>

          <Row>
            <Col>
              <h5>Deployments:</h5>
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
            </Col>
          </Row>
          <div className="row d-block">

          </div>
        </Col>
      </Row>
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
  team: PropTypes.object,
};

export default ServiceDetailsPage;

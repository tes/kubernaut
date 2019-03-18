import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Container,
  Row,
  Col,
  Progress,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
} from 'reactstrap';
import TablePagination from '../TablePagination';
import {
  AccountLink,
  ClusterLink,
  DeploymentLink,
  NamespaceLink,
  RegistryLink,
  ReleaseLink,
  SecretVersionLink,
  ServiceLink,
} from '../Links';

class ServicesPage extends Component {

  render() {
    const { meta, audits } = this.props;
    if (meta.loading.loadingPercent !== 100) return (
      <Container className="page-frame">
        <Row className="d-flex justify-content-center">
          <Col sm="12" className="mt-5">
            <Progress animated color="info" value={meta.loading.loadingPercent} />
          </Col>
        </Row>
      </Container>
    );

    if (meta.error && meta.error === 'Forbidden') {
      return (
        <Container className="page-frame">
          <Row>
            <Col xs="12">
              <p>You are not authorised to view this page.</p>
            </Col>
          </Row>
        </Container>
      );
    }

    return (
      <Container className="page-frame">
        <Row>
          <Col>
            { audits.items.map(audit => {
              return (
                <Row key={audit.id}>
                  <Col>
                    <Card className="m-1">
                      <CardHeader className="d-flex justify-content-between px-2 py-1">
                        <AccountLink account={audit.sourceAccount} />
                        {audit.createdOn}
                      </CardHeader>
                      <CardBody className="px-2 py-1">
                        {audit.action}
                      </CardBody>
                      <CardFooter className="d-flex justify-content-start px-2 py-1">
                        {
                          audit.account ? <div className="mr-1">
                            Account: <AccountLink account={audit.account} />
                          </div> : null
                        }
                        {
                          audit.cluster ? <div className="mr-1">
                            Cluster: <ClusterLink cluster={audit.cluster} />
                          </div> : null
                        }
                        {
                          audit.deployment ? <div className="mr-1">
                            Deployment: <DeploymentLink deployment={audit.deployment}>View</DeploymentLink>
                          </div> : null
                        }
                        {
                          audit.namespace ? <div className="mr-1">
                            Namespace: <NamespaceLink namespace={audit.namespace} pill showCluster />
                          </div> : null
                        }
                        {
                          audit.registry ? <div className="mr-1">
                            Registry: <RegistryLink registry={audit.registry} />
                          </div> : null
                        }
                        {
                          audit.release ? <div className="mr-1">
                            Release: <ReleaseLink release={audit.release} />
                          </div> : null
                        }
                        {
                          audit.secretVersion ? <div className="mr-1">
                            Secret version: <SecretVersionLink secretVersion={audit.secretVersion} />
                          </div> : null
                        }
                        {
                          audit.service ? <div className="mr-1">
                            Service: <ServiceLink service={audit.service} />
                          </div> : null
                        }
                      </CardFooter>
                    </Card>
                  </Col>
                </Row>
              );
            })}
          </Col>
        </Row>
        <Row>
          <Col>
            <TablePagination
              pages={audits.pages}
              page={audits.page}
              limit={audits.limit}
              fetchContent={this.props.fetchAuditPagination}
            />
          </Col>
        </Row>
      </Container>
    );
  }
}

ServicesPage.propTypes = {
  services: PropTypes.object,
};

export default ServicesPage;

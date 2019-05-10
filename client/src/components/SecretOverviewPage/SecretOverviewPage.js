import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Container,
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  Progress,
  Button
} from 'reactstrap';
import { ServicesSubNav } from '../SubNavs';
import { AccountLink, SecretVersionLink, NewSecretVersionLink } from '../Links';
import Title from '../Title';
import TablePagination from '../TablePagination';
import { Ago } from '../DisplayDate';

class SecretOverviewPage extends Component {

  render() {
    const { meta } = this.props;
    if (meta.loading.loadingPercent !== 100) return (
      <Container className="page-frame">
        <Row className="d-flex justify-content-center">
          <Col sm="12" className="mt-5">
            <Progress animated color="info" value={meta.loading.loadingPercent} />
          </Col>
        </Row>
      </Container>
    );

    if (!this.props.canManage) {
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

    const error = this.props.error;
    const versions = this.props.versions;

    return (
      <Container className="page-frame">
        <Title title={`Secrets: ${this.props.registryName}/${this.props.serviceName}`} />
        <ServicesSubNav
          registryName={this.props.registryName}
          serviceName={this.props.serviceName}
          canManage={this.props.canManage}
          namespace={this.props.namespace}
          secrets={true}
        />
        <Row>
          <Col md="8">
            <Row>
              <Col sm="12">
                {error && <span className="help-block"><span className="text-danger">{error}</span></span>}
              </Col>
            </Row>
            <Row>
              <Col>
                <h5>Versions:</h5>
              </Col>
            </Row>
            <Row>
              <Col>
                {
                  versions.items.map(version => (
                    <Row key={version.id} className="mb-2">
                      <Col>
                        <Card>
                          <CardHeader className="d-flex justify-content-between px-2 py-1">
                            <Ago date={version.createdOn} />
                            <div>
                              <span>Created by: </span>
                              <AccountLink account={version.createdBy} />
                            </div>
                            <SecretVersionLink secretVersion={version} />
                          </CardHeader>
                          <CardBody className="py-1 px-2">
                            <div>{version.comment}</div>
                          </CardBody>
                        </Card>
                      </Col>
                    </Row>
                  ))
                }
                {
                  versions.items.length === 0 ?
                  <Row>
                    <Col>
                      <span>There are no versions to display.</span>
                    </Col>
                  </Row>
                  : null
                }
              </Col>
            </Row>
            <Row>
              <Col>
                <TablePagination
                  pages={versions.pages}
                  page={versions.page}
                  limit={versions.limit}
                  fetchContent={({ page, limit }) => {
                    this.props.fetchVersionsPagination({
                      page,
                      limit,
                    });
                  }}
                  />
              </Col>
            </Row>
          </Col>
          <Col>
            <Row>
              <NewSecretVersionLink
                registryName={this.props.registryName}
                serviceName={this.props.serviceName}
                namespace={this.props.namespace}
              >
                <Button color="dark">
                  Create new version
                </Button>
              </NewSecretVersionLink>
            </Row>
          </Col>
        </Row>
      </Container>
    );
  }
}

SecretOverviewPage.propTypes = {
  serviceName: PropTypes.string.isRequired,
  registryName: PropTypes.string.isRequired,
  canManage: PropTypes.bool.isRequired,
  versions: PropTypes.object.isRequired,
};

export default SecretOverviewPage;

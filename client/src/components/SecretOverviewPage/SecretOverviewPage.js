import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Container,
  Row,
  Col,
  Table,
  Progress,
} from 'reactstrap';
import { ServicesSubNav } from '../SubNavs';
import Title from '../Title';
import TablePagination from '../TablePagination';

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
          <Col md="6">
            <Row>
              <Col sm="12">
                {error && <span className="help-block"><span className="text-danger">{error}</span></span>}
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
        </Row>
      </Container>
    );
  }
}

SecretOverviewPage.propTypes = {
  serviceName: PropTypes.string.isRequired,
  registryName: PropTypes.string.isRequired,
  serviceId: PropTypes.string.isRequired,
  canManage: PropTypes.bool.isRequired,
};

export default SecretOverviewPage;

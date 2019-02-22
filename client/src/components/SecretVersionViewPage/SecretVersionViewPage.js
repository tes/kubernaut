import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Container,
  Row,
  Col,
  Progress,
} from 'reactstrap';
import { ServicesSubNav } from '../SubNavs';
import SecretViewer from '../SecretViewer';
import Title from '../Title';

class SecretVersionViewPage extends Component {

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

    const error = meta.error;
    const version = this.props.version;

    return (
      <Container className="page-frame">
        <Title title={`Secret: `} />
        <ServicesSubNav
          registryName={version.service.registry.name}
          serviceName={version.service.name}
          canManage={true}
          namespace={version.namespace}
          secrets={true}
          version={version}
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
                <h5>Secrets:</h5>
                {
                  version.secrets.map(secret => (
                    <SecretViewer key={secret.key} secret={secret} />
                  ))
                }
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    );
  }
}

SecretVersionViewPage.propTypes = {
  version: PropTypes.object.isRequired,
  namespace: PropTypes.object.isRequired,
  meta: PropTypes.object.isRequired,
};

export default SecretVersionViewPage;

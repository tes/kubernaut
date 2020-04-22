import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import {
  Container,
  Row,
  Col,
  Label,
  Form,
  FormGroup,
  Progress,
  Button,
} from 'reactstrap';
import { ServicesSubNav } from '../SubNavs';
import RenderInput from '../RenderInput';
import SecretEditor from '../SecretEditor';
import Title from '../Title';

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
    const secretErrors = this.props.secretErrors;
    return (
      <Container className="page-frame">
        <Title title={`Secrets: ${this.props.registryName}/${this.props.serviceName}`} />
        <ServicesSubNav
          registryName={this.props.registryName}
          serviceName={this.props.serviceName}
          canManage={this.props.canManage}
          namespace={this.props.namespace}
          secrets={true}
          newVersion={true}
        />
        <Row>
          <Col md="12">
            <Row>
              <Col sm="12">
                {error && <span className="help-block"><span className="text-danger">{error}</span></span>}
              </Col>
            </Row>
            <Form onSubmit={this.props.handleSubmit(this.props.saveVersion)}>
              <FormGroup row>
                <Label sm="3" className="text-right" for="comment">A comment to reference by:</Label>
                <Col sm="6">
                  <Field
                    className="form-control"
                    name="comment"
                    component={RenderInput}
                    type="text"
                    autoComplete="foo-no-really"
                    placeholder="Like a git commit message"
                  />
                </Col>
                <Col><Button color="dark" disabled={!this.props.canSave} type="submit">Save</Button></Col>
              </FormGroup>
              <SecretEditor
                secretErrors={secretErrors}
                formSecrets={this.props.formSecrets}
                formValues={this.props.formValues}
                addSecret={this.props.addSecret}
                saveVersion={this.props.saveVersion}
                removeSecret={this.props.removeSecret}
                validateAnnotations={this.props.validateAnnotations}
              />
            </Form>
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
};

export default SecretOverviewPage;

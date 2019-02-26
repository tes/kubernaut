import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field, FieldArray, FormSection } from 'redux-form';
import {
  Container,
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  Label,
  Form,
  FormGroup,
  Progress,
  Button,
} from 'reactstrap';
import AceEditor from 'react-ace';
import 'brace/mode/json';
import 'brace/theme/vibrant_ink';
import 'brace/ext/language_tools';
import { ServicesSubNav } from '../SubNavs';
import RenderInput from '../RenderInput';
import RenderSelect from '../RenderSelect';
import Title from '../Title';
require('brace');

class RenderJsonEditor extends Component {
  render() {
    return (
      <AceEditor
        value={this.props.input.value}
        mode="json"
        theme="vibrant_ink"
        onChange={this.props.input.onChange}
        name={`${this.props.input.name}-editor`}
        editorProps={{
          $blockScrolling: true,
        }}
        setOptions={{
          useSoftTabs: true
        }}
        enableBasicAutocompletion={true}
        enableLiveAutocompletion={true}
        tabSize={2}
        width="100%"
        height="300px"
        showPrintMargin={false}
      />
    );
  }
}

class RenderSecrets extends Component {
  render() {
    return (
      <Row>
        <Col>
          {this.props.fields.map((secret, index) => {
            return (
              <Card className="mb-2" key={this.props.fields.get(index).key}>
                <CardHeader className="d-flex justify-content-between">
                  <span>{this.props.fields.get(index).key}</span>
                  <i className="fa fa-trash" onClick={() => this.props.fields.remove(index)}></i>
                </CardHeader>
                <CardBody>
                  {
                    this.props.fields.get(index).editor === 'simple' ? (
                      <Field
                        name={`${secret}.value`}
                        className="form-control"
                        component={RenderInput}
                        type="text"
                        autoComplete="foo-no-really"
                        />
                    ) : this.props.fields.get(index).editor === 'json' ? (
                      <Field
                        name={`${secret}.value`}
                        className="form-control"
                        component={RenderJsonEditor}
                        />
                    ) : null
                  }
                </CardBody>
              </Card>
            );
          })}
        </Col>
      </Row>
    );
  }
}

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
            <Row>
              <Col>
                <Form onSubmit={this.props.handleSubmit(this.props.saveVersion)}>
                  <FormGroup row>
                    <Label sm="3" className="text-right" for="comment">Comment:</Label>
                    <Col sm="6">
                      <Field
                        className="form-control"
                        name="comment"
                        component={RenderInput}
                        type="text"
                        autoComplete="foo-no-really"
                      />
                    </Col>
                    <Col><Button disabled={!this.props.canSave} type="submit">Save</Button></Col>
                  </FormGroup>
                  <FormGroup row>
                    <Label sm="3" className="text-right" for="secrets">Secrets:</Label>
                    <Col>
                      <FieldArray name="secrets" component={RenderSecrets} />
                    </Col>
                  </FormGroup>
                  <FormSection name="newSecretSection">
                    <FormGroup row>
                      <Label sm="3" className="text-right" for="newsecret">New Secret (key):</Label>
                      <Col>
                        <Field
                          name="newSecretName"
                          type="text"
                          component={RenderInput}
                          autoComplete="foo-no-really"
                        />
                      </Col>
                    </FormGroup>
                    <FormGroup row>
                      <Label sm="3" className="text-right" for="newsecret">New Secret (type):</Label>
                      <Col>
                        <Field
                          name="newSecretType"
                          type="text"
                          component={RenderSelect}
                          autoComplete="foo-no-really"
                          options={['simple', 'json']}
                        />
                      </Col>
                    </FormGroup>
                    <FormGroup row>
                      <Col sm="3"></Col>
                      <Col><Button disabled={!this.props.canAddNewSecret} onClick={() => this.props.addSecret()}>Add</Button></Col>
                    </FormGroup>
                  </FormSection>
                </Form>
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
  canManage: PropTypes.bool.isRequired,
};

export default SecretOverviewPage;

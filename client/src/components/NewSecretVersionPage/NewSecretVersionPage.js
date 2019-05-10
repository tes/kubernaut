import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field, FieldArray, FormSection } from 'redux-form';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Label,
  Form,
  FormGroup,
  Progress,
  Button,
  TabContent,
  TabPane,
  ListGroup,
  ListGroupItem,
} from 'reactstrap';
import { ServicesSubNav } from '../SubNavs';
import RenderInput from '../RenderInput';
import RenderSelect from '../RenderSelect';
import RenderEditor from '../RenderEditor';
import Title from '../Title';

const editorLookup = {
  simple: {
    value: 'simple',
    display: 'simple'
  },
  json: {
    value: 'json',
    display: 'json (linted)'
  },
  plain_text: {
    value: 'plain_text',
    display: 'plain text'
  },
};

class RenderSecretsTabbed extends Component {
  render() {
    return (
      <TabContent activeTab={this.props.activeTab}>
        {this.props.fields.map((secret, index) => {
          return (
            <TabPane tabId={`${index + 1}`} key={this.props.fields.get(index).key}>
              <Row>
                <Col className="p-2">
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
                        component={RenderEditor}
                        mode="json"
                        validateAnnotations={this.props.validateAnnotations}
                        index={index}
                      />
                  ) : this.props.fields.get(index).editor === 'plain_text' ? (
                      <Field
                        name={`${secret}.value`}
                        className="form-control"
                        component={RenderEditor}
                        mode="plain_text"
                        index={index}
                      />
                    ) : null
                  }
                </Col>
              </Row>
            </TabPane>
          );
        })}
      </TabContent>
    );
  }
}

class SecretOverviewPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeTab: '1',
    };
    this.toggleTab = this.toggleTab.bind(this);
  }

  toggleTab(tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab
      });
    }
  }

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
              <Row>
                <Col>
                  <Card>
                    <CardBody className="p-0 min-vh-75 max-vh-75">
                      <Row>
                        <Col sm="3" className="border-right pr-0">
                          <ListGroup flush className="min-vh-75 max-vh-75 overflow-auto">
                            <ListGroupItem className="p-1">
                              <h6 className="mb-1">Secret keys:</h6>
                              {
                                this.props.formSecrets.length === 0 ?
                                <small>There are no keys in this secret.</small>
                                : null
                              }
                            </ListGroupItem>
                            {this.props.formSecrets.map((secret, index) => (
                              <ListGroupItem
                                action
                                onClick={() => this.toggleTab(`${index + 1}`) }
                                key={secret.key}
                                className="p-1"
                                active={this.state.activeTab === `${index + 1}`}
                              >
                                <p className="mb-1">{secret.key}</p>
                                <div className="d-flex justify-content-between">
                                  <small>{`Type: ${editorLookup[secret.editor].display}`}</small>
                                  <div>
                                    { secretErrors[index] && secretErrors[index].value ? <i className="fa fa-exclamation-circle mr-1"></i> : null }
                                    <i className="fa fa-trash clickable mr-2" onClick={() => this.props.removeSecret(index)}></i>
                                  </div>
                                </div>
                              </ListGroupItem>
                            ))}
                          </ListGroup>
                        </Col>
                        <Col>
                          <FieldArray
                            name="secrets"
                            activeTab={this.state.activeTab}
                            component={RenderSecretsTabbed}
                            validateAnnotations={this.props.validateAnnotations}
                          />
                        </Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
              <FormSection name="newSecretSection">
                <Row form className="mt-2">
                  <Col>
                    <FormGroup>
                      <Label className="text-right" for="newsecret">New Secret (key) name:</Label>
                      <Field
                        name="newSecretName"
                        type="text"
                        component={RenderInput}
                        autoComplete="foo-no-really"
                        className="form-control"
                        placeholder="Example: config.json"
                      />
                    </FormGroup>
                  </Col>
                  <Col>
                    <FormGroup>
                      <Label className="text-right" for="newsecret">Editor:</Label>
                      <Field
                        name="newSecretType"
                        type="text"
                        component={RenderSelect}
                        autoComplete="foo-no-really"
                        options={Object.values(editorLookup)}
                        className="form-control"
                      />
                    </FormGroup>
                  </Col>
                  <Col className="d-flex align-items-end">
                    <FormGroup>
                      <Button
                        color="light"
                        disabled={!this.props.canAddNewSecret}
                        onClick={() => this.props.addSecret()}
                      >Add to secret</Button>
                    </FormGroup>
                  </Col>
                </Row>
              </FormSection>
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

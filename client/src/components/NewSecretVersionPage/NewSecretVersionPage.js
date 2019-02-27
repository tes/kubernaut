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
import RenderJsonEditor from '../RenderJsonEditor';
import Title from '../Title';


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
                        component={RenderJsonEditor}
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
              <Row>
                <Col>
                  <Card>
                    <CardBody className="p-0 min-vh-75 max-vh-75">
                      <Row>
                        <Col sm="3" className="border-right pr-0">
                          <ListGroup flush className="min-vh-75 max-vh-75 overflow-auto">
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
                                  <small>{`Type: ${secret.editor}`}</small>
                                  <i className="fa fa-trash clickable mr-2" onClick={() => this.props.removeSecret(index)}></i>
                                </div>
                              </ListGroupItem>
                            ))}
                          </ListGroup>
                        </Col>
                        <Col>
                          <FieldArray name="secrets" activeTab={this.state.activeTab} component={RenderSecretsTabbed} />
                        </Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
              <FormSection name="newSecretSection">
                <Row form>
                  <Col>
                    <FormGroup>
                      <Label className="text-right" for="newsecret">New Secret (key)</Label>
                      <Field
                        name="newSecretName"
                        type="text"
                        component={RenderInput}
                        autoComplete="foo-no-really"
                        className="form-control"
                      />
                    </FormGroup>
                  </Col>
                  <Col>
                    <FormGroup>
                      <Label className="text-right" for="newsecret">New Secret (type)</Label>
                      <Field
                        name="newSecretType"
                        type="text"
                        component={RenderSelect}
                        autoComplete="foo-no-really"
                        options={['simple', 'json']}
                        className="form-control"
                      />
                    </FormGroup>
                  </Col>
                  <Col className="d-flex align-items-end">
                    <FormGroup>
                      <Button
                        disabled={!this.props.canAddNewSecret}
                        onClick={() => this.props.addSecret()}
                      >Add</Button>
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

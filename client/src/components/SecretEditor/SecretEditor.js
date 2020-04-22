import React, { Component } from 'react';
import { Field, FieldArray, FormSection } from 'redux-form';
import PropTypes from 'prop-types';
import RenderInput from '../RenderInput';
import RenderSelect from '../RenderSelect';
import RenderEditor from '../RenderEditor';
import {
  Row,
  Col,
  TabContent,
  TabPane,
  ListGroup,
  ListGroupItem,
  FormGroup,
  Label,
  Button,
  Card,
  CardBody,
} from 'reactstrap';

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
                        height={this.props.height}
                      />
                  ) : this.props.fields.get(index).editor === 'plain_text' ? (
                      <Field
                        name={`${secret}.value`}
                        className="form-control"
                        component={RenderEditor}
                        mode="plain_text"
                        index={index}
                        height={this.props.height}
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

class SecretEditor extends Component {
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
    const {
      secretErrors,
      formValues,
      height = 'normal',
    } = this.props;

    const canAddNewSecret = formValues
      && formValues.newSecretSection
      && formValues.newSecretSection.newSecretName
      && formValues.newSecretSection.newSecretType
      && (!(formValues.secrets || []).find(s => s.key === formValues.newSecretSection.newSecretName));

    return (
      <div>
        <Row>
          <Col>
            <Card>
              <CardBody className={`p-0 min-vh-${height === 'normal' ? '75': '50'} max-vh-${height === 'normal' ? '75': '50'}`}>
                <Row>
                  <Col sm="3" className="border-right pr-0">
                    <ListGroup flush className={`min-vh-${height === 'normal' ? '75': '50'} max-vh-${height === 'normal' ? '75': '50'} overflow-auto`}>
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
                      height={height}
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
                  disabled={!canAddNewSecret}
                  onClick={() => this.props.addSecret()}
                >Add to secret</Button>
              </FormGroup>
            </Col>
          </Row>
        </FormSection>
      </div>
    );
  }
}

SecretEditor.propTypes = {
  secretErrors: PropTypes.array.isRequired,
  formValues: PropTypes.object.isRequired,
  addSecret: PropTypes.func.isRequired,
  removeSecret: PropTypes.func.isRequired,
  validateAnnotations: PropTypes.func.isRequired,
  formSecrets: PropTypes.array.isRequired,
  height: PropTypes.oneOf(['normal', 'small']),
};

export default SecretEditor;

import React, { Component } from 'react';
import { Field } from 'redux-form';
import PropTypes from 'prop-types';
import {
  Container,
  Row,
  Col,
  Form,
  FormGroup,
  Label,
  Card,
  CardHeader,
  CardBody,
} from 'reactstrap';
import RenderInput from '../RenderInput';
import RenderTypeAhead from '../RenderTypeAhead';
import RenderSelect from '../RenderSelect';
import RenderSecretVersions from '../RenderSecretVersions';
import { NamespaceLink } from '../Links';


class DeployPage extends Component {

  render() {
    const {
      error,
      valid,
      asyncValidating,
      registrySelected,
      serviceSelected,
      clusterSelected,
      namespaceSelected,
      clearFormFields,
      validateService,
      validateVersion,
      fetchSecretVersions,
    } = this.props;

    const validRegistryAndService = (registrySelected && serviceSelected);
    const validCluster = (validRegistryAndService && clusterSelected);
    const validNamespace = (validCluster && namespaceSelected);

    const {
      namespace: formNamespace,
      version: formVersion,
      cluster: formCluster,
    } = this.props.currentFormValues;
    const chosenNamespace = this.props.namespacesRich.find(({ name, cluster }) => (formNamespace === name) && formCluster === cluster.name);
    const previouslyDeployedToChosenNamespace = chosenNamespace && this.props.deployments.find((dep) => (dep.namespace.name === chosenNamespace.name) && (dep.namespace.cluster.name === chosenNamespace.cluster.name));

    return (
      <Container className="page-frame">
        <Row>
          <Col>
            <h4>Create deployment</h4>
          </Col>
        </Row>
        <Row>
          <Col md="5">
            <Form onSubmit={this.props.handleSubmit(this.props.submitForm)}>
              <FormGroup row>
                <Label sm="3" className="text-right" for="registry">Registry:</Label>
                <Col sm="9">
                  <Field
                    className="form-control"
                    name="registry"
                    component={RenderSelect}
                    options={this.props.registries}
                    onChange={() => {
                      clearFormFields({ source: 'registry' });
                    }}
                  />
                </Col>
              </FormGroup>
              <FormGroup row>
                <Label sm="3" className="text-right" for="service">What:</Label>
                <Col sm="9">
                  <Field
                    className="form-control"
                    name="service"
                    component={RenderTypeAhead}
                    type="text"
                    disabled={!registrySelected}
                    onChangeListener={() => {
                      this.props.fetchServiceSuggestions();
                      clearFormFields({ source: 'service' });
                      validateService();
                    }}
                    useSuggestion={this.props.useServiceSuggestion}
                    suggestions={this.props.serviceSuggestions}
                    autoComplete="foo-no-really"
                  />
                </Col>
              </FormGroup>
              <FormGroup row>
                <Label sm="3" className="text-right" for="version">Version:</Label>
                <Col sm="9">
                  <Field
                    className="form-control"
                    name="version"
                    component={RenderInput}
                    type="text"
                    disabled={!validRegistryAndService}
                    autoComplete="foo-no-really"
                    onChange={(evt, newValue) => {
                      clearFormFields({ source: 'version' });
                      validateVersion({
                        newValue
                      });
                    }}
                  />
                </Col>
              </FormGroup>
              <FormGroup row>
                <Label sm="3" className="text-right" for="cluster">Where:</Label>
                <Col sm="9">
                  <Field
                    className="form-control"
                    name="cluster"
                    component={RenderSelect}
                    options={this.props.clusters}
                    disabled={!validRegistryAndService}
                    onChange={() => {
                      clearFormFields({ source: 'cluster' });
                    }}
                  />
                </Col>
              </FormGroup>
              <FormGroup row>
                <Label sm="3" className="text-right" for="namespace">Namespace:</Label>
                <Col sm="9">
                  <Field
                    className="form-control"
                    name="namespace"
                    component={RenderSelect}
                    options={this.props.namespaces}
                    disabled={!validCluster}
                    onChange={(evt, newValue) => {
                      clearFormFields({ source: 'namespace' });
                      fetchSecretVersions(this.props.namespacesRich.find(({ name, cluster }) => (newValue === name) && formCluster === cluster.name));
                    }}
                  />
                </Col>
              </FormGroup>
              <FormGroup row>
                <Label sm="3" className="text-right" for="secret">Secret:</Label>
                <Col sm="9">
                  <Field
                    className=""
                    name="secret"
                    component={RenderSecretVersions}
                    options={this.props.secretVersions}
                    disabled={!validNamespace}
                  />
                </Col>
              </FormGroup>
              <FormGroup row>
                <Col sm={{ size: 9, offset: 3 }}>
                  <button
                    type="submit"
                    className="btn btn-dark"
                    disabled={!valid && !asyncValidating}
                    >Create Deployment
                  </button>
                  {error && <span className="help-block"><span className="text-danger">{error}</span></span>}
                </Col>
              </FormGroup>
            </Form>
          </Col>
          <Col sm="5">
            {
              this.props.deployments.length ? (
                <Card>
                  <CardHeader>Summary:</CardHeader>
                  <CardBody>
                    {
                      this.props.deployments.map((dep) => {
                        const deployingToThisNamespace = chosenNamespace && (dep.namespace.name === chosenNamespace.name) && (dep.namespace.cluster.name === chosenNamespace.cluster.name);
                        return (
                          <Row key={dep.namespace.id}>
                            <Col xs="6">
                              <div className="float-right">
                                <NamespaceLink namespace={dep.namespace} showCluster pill />
                              </div>
                            </Col>
                            <Col xs="6" className="pl-0">
                              <div>
                                { deployingToThisNamespace ? (
                                  (<span>
                                    <s>
                                      <span style={{ backgroundColor: '#fdb8c0' }}>{dep.release.version}</span>
                                    </s>
                                    &nbsp;
                                    <span style={{ backgroundColor: '#acf2bd' }}>{formVersion}</span>
                                  </span>)
                                ) : dep.release.version }
                              </div>
                            </Col>
                          </Row>
                        );
                      })
                    }
                    {
                      chosenNamespace && (previouslyDeployedToChosenNamespace ? null : (
                        <Row>
                          <Col xs="6">
                            <div className="float-right">
                              <NamespaceLink namespace={chosenNamespace} showCluster pill />
                            </div>
                          </Col>
                          <Col xs="6" className="pl-0">
                            <div>
                              <span style={{ backgroundColor: '#acf2bd' }}>{formVersion}</span>
                            </div>
                          </Col>
                        </Row>
                      ))
                    }
                  </CardBody>
                </Card>
              ) : null
            }
          </Col>
        </Row>
      </Container>
    );
  }
}

DeployPage.propTypes = {
  initialValues: PropTypes.object,
  registries: PropTypes.array,
  clusters: PropTypes.array,
  namespaces: PropTypes.array,
  submitForm: PropTypes.func.isRequired,
  deployments: PropTypes.array,
};

export default DeployPage;

import React, { Component } from 'react';
import { Field, FieldArray, FormSection } from 'redux-form';
import {
  Row,
  Col,
  FormGroup,
  Label,
  Button,
  Progress,
  Form,
  Card,
  CardHeader,
  CardBody,
} from 'reactstrap';
import Title from '../Title';
import { AdminSubNav } from '../SubNavs';
import RenderInput from '../RenderInput';
import RenderSelect from '../RenderSelect';

class RenderClusterIngressHosts extends Component {
  render() {

    return (
      <div>
          {
            this.props.fields.map((host, index) => {
              return (
                <FormGroup row key={host}>
                  <Label sm="3" className="text-right" for={host}>{this.props.fields.get(index).ingressHostKey.name}:</Label>
                    <Col sm="8">
                      <Field
                        className="form-control"
                        name={`${host}.value`}
                        component={RenderInput}
                        type="text"
                        autoComplete="off"
                      />
                    </Col>
                </FormGroup>
              );
            })
          }
      </div>
    );
  }
}

class RenderClusterIngressVariables extends Component {
  render() {

    return (
      <div>
          {
            this.props.fields.map((variable, index) => {
              return (
                <FormGroup row key={variable}>
                  <Label sm="3" className="text-right" for={variable}>{this.props.fields.get(index).ingressVariableKey.name}:</Label>
                    <Col sm="8">
                      <Field
                        className="form-control"
                        name={`${variable}.value`}
                        component={RenderInput}
                        type="text"
                        autoComplete="off"
                      />
                    </Col>
                </FormGroup>
              );
            })
          }
      </div>
    );
  }
}

class ClusterEditPage extends Component {

  render() {
    const { meta } = this.props;
    if (meta.loading.loadingPercent !== 100) return (
      <Row className="page-frame d-flex justify-content-center">
        <Col sm="12" className="mt-5">
          <Progress animated color="info" value={meta.loading.loadingPercent} />
        </Col>
      </Row>
    );

    if (!this.props.hasClustersWrite) {
      return (
        <Row className="page-frame">
          <Col xs="12">
            <p>You are not authorised to view this page.</p>
          </Col>
        </Row>
      );
    }

    const {
      error,
      cluster,
      canAudit,
      hasClustersWrite,
      hasIngressAdminWrite,
      handleSubmit,
      submitForm,
      submitNewHostForm,
      submitNewVariableForm,
      updateHostsForm,
      updateVariablesForm,
    } = this.props;

    return (
      <Row className="page-frame">
        <Col>
          <Title title={`Edit cluster: ${cluster.name}`} />
          <AdminSubNav canAudit={canAudit} hasClustersWrite={hasClustersWrite} edit cluster={cluster} hasIngressAdminWrite={hasIngressAdminWrite} />
          <Form>
            <Row>
              <Col md="6">
                <FormSection name="cluster">
                  <FormGroup row>
                    <Label sm="3" className="text-right" for="name">Name:</Label>
                    <Col sm="9">
                      <Field
                        className="form-control"
                        name="name"
                        component={RenderInput}
                        type="text"
                        autoComplete="off"
                      />
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Label sm="3" className="text-right" for="config">Config:</Label>
                    <Col sm="9">
                      <Field
                        className="form-control"
                        name="config"
                        component={RenderInput}
                        type="text"
                        autoComplete="off"
                      />
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Label sm="3" className="text-right" for="context">Context:</Label>
                    <Col sm="9">
                      <Field
                        className="form-control"
                        name="context"
                        component={RenderInput}
                        type="text"
                        autoComplete="off"
                      />
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Label sm="3" className="text-right" for="color">Color:</Label>
                    <Col sm="9">
                      <Field
                        className="form-control"
                        name="color"
                        component={RenderInput}
                        type="text"
                        autoComplete="off"
                      />
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Label sm="3" className="text-right" for="priority">Priority:</Label>
                    <Col sm="9">
                      <Field
                        className="form-control"
                        name="priority"
                        component={RenderInput}
                        type="text"
                        autoComplete="off"
                      />
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Col>
                      {error && <span className="help-block"><span className="text-danger">{error}</span></span>}
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Col>
                      <Button
                        className="pull-right"
                        color="dark"
                        onClick={handleSubmit(submitForm)}
                        >Save</Button>
                    </Col>
                  </FormGroup>
                </FormSection>
              </Col>

              <Col>
                <Row className="mb-2">
                  <Col>
                    <Card>
                      <CardHeader className="py-2">Ingress host values:</CardHeader>
                      <CardBody>
                        <FormSection name="clusterIngressHosts">
                          <FieldArray
                            name="hosts"
                            component={RenderClusterIngressHosts}
                          />
                        </FormSection>
                        <FormGroup row>
                          <Col>
                            <Button
                              className="pull-right"
                              color="dark"
                              onClick={handleSubmit(updateHostsForm)}
                              >Update</Button>
                          </Col>
                        </FormGroup>
                        <hr />
                        <h6>New host value:</h6>
                        <FormSection name="newIngressHostValue">
                          <FormGroup row>
                            <Label sm="3" className="text-right" for="ingressHostKey">Host key:</Label>
                            <Col sm="8">
                              <Field
                                name="ingressHostKey"
                                className="form-control"
                                component={RenderSelect}
                                options={this.props.availableIngressHostKeys.map(ihk => ({
                                  value: ihk.id,
                                  display: ihk.name,
                                }))}
                                autoComplete="off"
                              />
                            </Col>
                          </FormGroup>
                          <FormGroup row>
                            <Label sm="3" className="text-right" for="value">Value:</Label>
                            <Col sm="8">
                              <Field
                                name="value"
                                className="form-control"
                                component={RenderInput}
                                type="text"
                                autoComplete="off"
                              />
                            </Col>
                          </FormGroup>
                          <FormGroup row>
                            <Col>
                              <Button
                                className="pull-right"
                                color="dark"
                                onClick={handleSubmit(submitNewHostForm)}
                                >Add</Button>
                            </Col>
                          </FormGroup>
                        </FormSection>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>

                <Row>
                  <Col>
                    <Card>
                      <CardHeader className="py-2">Ingress Variable values:</CardHeader>
                      <CardBody>
                        <FormSection name="clusterIngressVariables">
                          <FieldArray
                            name="variables"
                            component={RenderClusterIngressVariables}
                          />
                        </FormSection>
                        <FormGroup row>
                          <Col>
                            <Button
                              className="pull-right"
                              color="dark"
                              onClick={handleSubmit(updateVariablesForm)}
                              >Update</Button>
                          </Col>
                        </FormGroup>
                        <hr />
                        <h6>New variable value:</h6>
                        <FormSection name="newIngressVariableValue">
                          <FormGroup row>
                            <Label sm="3" className="text-right" for="ingressVariableKey">Variable key:</Label>
                            <Col sm="8">
                              <Field
                                name="ingressVariableKey"
                                className="form-control"
                                component={RenderSelect}
                                options={this.props.availableIngressVariableKeys.map(ivk => ({
                                  value: ivk.id,
                                  display: ivk.name,
                                }))}
                                autoComplete="off"
                              />
                            </Col>
                          </FormGroup>
                          <FormGroup row>
                            <Label sm="3" className="text-right" for="value">Value:</Label>
                            <Col sm="8">
                              <Field
                                name="value"
                                className="form-control"
                                component={RenderInput}
                                type="text"
                                autoComplete="off"
                              />
                            </Col>
                          </FormGroup>
                          <FormGroup row>
                            <Col>
                              <Button
                                className="pull-right"
                                color="dark"
                                onClick={handleSubmit(submitNewVariableForm)}
                                >Add</Button>
                            </Col>
                          </FormGroup>
                        </FormSection>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>
    );
  }
}

ClusterEditPage.propTypes = {

};

export default ClusterEditPage;

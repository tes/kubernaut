import React, { Component } from 'react';
import { Field, FieldArray, FormSection } from 'redux-form';
import {
  Row,
  Col,
  Form,
  FormGroup,
  Label,
  Card,
  CardHeader,
  CardBody,
  Button,
  Progress,
} from 'reactstrap';
import Title from '../Title';
import { ServicesSubNav } from '../SubNavs';
import RenderInput from '../RenderInput';
import RenderSelect from '../RenderSelect';
import Popover from '../Popover';


class RenderRules extends Component {
  render() {

    return (
      <Row>
        <Col>
          {this.props.fields.map((rule, index) => {
            const ruleData = this.props.fields.get(index);
            return (
              <Card className="mb-2">
                <CardBody className="py-2">
                  <Button
                    close
                    onClick={() => {
                      this.props.fields.remove(index);
                    }}
                    >
                    <i
                      className="fa fa-trash text-danger"
                      aria-hidden='true'
                    ></i>
                  </Button>

                  <Row>
                    <Col sm="9">
                      <FormGroup>
                        <Label for={`${rule}.path`}>Path:</Label>
                        <Field
                          className="form-control"
                          name={`${rule}.path`}
                          component={RenderInput}
                          type="text"
                          autoComplete="off"
                        />
                      </FormGroup>
                    </Col>
                    <Col sm="3">
                      <FormGroup>
                        <Label for={`${rule}.port`}>Port:</Label>
                        <Field
                          className="form-control"
                          name={`${rule}.port`}
                          component={RenderInput}
                          type="text"
                          autoComplete="off"
                          placeholder="80"
                        />
                      </FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col sm="5">
                      <FormGroup>
                        <Label for={`${rule}.host`}>Host:</Label>
                        <Field
                          className="form-control"
                          name={`${rule}.host`}
                          component={RenderSelect}
                          type="text"
                          autoComplete="off"
                          options={this.props.ingressHostKeys}
                          disabled={ruleData.customHost}
                        />
                      </FormGroup>
                    </Col>
                    <Col sm="7">
                      <FormGroup>
                        <Label for={`${rule}.customHost`}>Custom host:</Label>
                        <Field
                          className="form-control"
                          name={`${rule}.customHost`}
                          component={RenderInput}
                          type="text"
                          autoComplete="off"
                        />
                      </FormGroup>
                    </Col>
                  </Row>


                </CardBody>
              </Card>
            );
          })}
        </Col>
      </Row>
    );
  }
}

class RenderAnnotations extends Component {
  render() {

    return (
      <Row>
        <Col>
          {this.props.fields.map((annotation, index) => {
            return (
              <Card className="mb-2">
                <CardBody className="py-2">
                  <Row>
                    <Col sm="6">
                      <FormGroup>
                        <Label className="text-right" for={`${annotation}.name`}>Name:</Label>
                        <Field
                          className="form-control"
                          name={`${annotation}.name`}
                          component={RenderSelect}
                          autoComplete="off"
                          options={[
                            'nginx.ingress.kubernetes.io/rewrite-target',
                            'nginx.ingress.kubernetes.io/use-regex',
                            'nginx.ingress.kubernetes.io/configuration-snippet'
                          ]}
                        />
                      </FormGroup>
                    </Col>
                    <Col sm="6">
                      <FormGroup>
                        <Label className="text-right" for={`${annotation}.value`}>Value:</Label>
                        <Field
                          className="form-control"
                          name={`${annotation}.value`}
                          component={RenderInput}
                          type="text"
                          autoComplete="off"
                          />
                      </FormGroup>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            );
          })}
        </Col>
      </Row>
    );
  }
}

class RenderEntries extends Component {
  render() {
    const {
      ingressClasses,
      ingressHostKeys,
    } = this.props;
    return (
      <Row>
        <Col>
          {this.props.fields.map((entry, index) => {
            const entryData = this.props.fields.get(index);
            return (
              <Card className="mb-3">
                <CardHeader>
                  <span>Entry: {entryData.name}</span>
                  <Button
                    close
                    onClick={() => {
                      this.props.fields.remove(index);
                    }}
                    >
                    <i
                      className="fa fa-trash text-danger"
                      aria-hidden='true'
                      ></i>
                  </Button>
                </CardHeader>
                <CardBody className="py-2">
                  <Row className="mb-2">
                    <Col>
                      <FormGroup row >
                        <Label sm="3" className="text-right" for={`${entry}.ingressClass`}>Ingress class:</Label>
                        <Col sm="5">
                          <Field
                            className="form-control"
                            name={`${entry}.ingressClass`}
                            component={RenderSelect}
                            autoComplete="off"
                            options={ingressClasses}
                          />
                        </Col>
                      </FormGroup>
                    </Col>
                  </Row>

                  <Row className="mb-2">
                    <Col>
                      <Card>
                        <CardHeader><span>Annotations</span></CardHeader>
                        <CardBody className="py-2">
                          <FieldArray
                            name={`${entry}.annotations`}
                            component={RenderAnnotations}
                          />
                        </CardBody>
                      </Card>
                    </Col>
                  </Row>

                  <Row className="mb-2">
                    <Col>
                      <Card>
                        <CardHeader><span>Rules</span></CardHeader>
                        <CardBody className="py-2">
                          <FieldArray
                            name={`${entry}.rules`}
                            component={RenderRules}
                            ingressHostKeys={ingressHostKeys}
                          />
                        </CardBody>
                      </Card>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            );
          })}
        </Col>
      </Row>
    );
  }
}

class NewIngressVersionPage extends Component {

  render() {

    const {
      ingressClasses,
      ingressHostKeys,
    } = this.props;

    return (
      <Row className="page-frame">
        <Col>
          <Title title={`New ingress version `}/>
          <ServicesSubNav  />

          <Form>
            <Row>
              <Col>
                <FormGroup row>
                  <Label sm="3" className="text-right" for="comment">Comment:</Label>
                  <Col sm="7">
                    <Field
                      className="form-control"
                      name="comment"
                      component={RenderInput}
                      type="text"
                      autoComplete="off"
                    />
                  </Col>
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col>
                <FieldArray
                  name="entries"
                  component={RenderEntries}
                  ingressClasses={ingressClasses}
                  ingressHostKeys={ingressHostKeys}
                />
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>
    );
  }
}

export default NewIngressVersionPage;

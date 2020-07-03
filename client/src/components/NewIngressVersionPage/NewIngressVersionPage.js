import React, { Component } from 'react';
import { Field, FieldArray } from 'redux-form';
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
  Collapse,
} from 'reactstrap';
import { customAlphabet } from 'nanoid';
import Title from '../Title';
import { ServicesSubNav } from '../SubNavs';
import RenderInput from '../RenderInput';
import RenderSelect from '../RenderSelect';
// import Popover from '../Popover';
const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 16);

class RenderRules extends Component {
  render() {

    return (
      <Row>
        <Col>
          {this.props.fields.map((rule, index) => {
            const ruleData = this.props.fields.get(index);
            return (
              <Card className="mb-2" key={index}>
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
          <Row>
            <Col>
              <Button
                outline
                className="pull-right"
                onClick={() => {
                  this.props.fields.push({
                    port: '80',
                  });
                }}
              >Add rule
              </Button>
            </Col>
          </Row>
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
              <Card className="mb-2" key={index}>
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
          <Row>
            <Col>
              <Button
                outline
                className="pull-right"
                onClick={() => { this.props.fields.push({}); }}
              >Add annotation
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }
}

class RenderEntry extends Component {
  constructor(props) {
    super(props);
    this.toggleAnnotationsCollapsed = this.toggleAnnotationsCollapsed.bind(this);
    this.state = {
      annotationsCollapsed: true,
    };
  }

  toggleAnnotationsCollapsed() {
    this.setState({
      annotationsCollapsed: !this.state.annotationsCollapsed,
    });
  }

  render() {
    const {
      ingressClasses,
      ingressHostKeys,
      entryData,
      entry,
      index,
    } = this.props;
    return (
      <Card className="mb-3">
        <CardHeader className="py-2">
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
                <CardHeader className="py-2">
                  <span>Annotations</span>
                  <Button
                    close
                    onClick={() => this.toggleAnnotationsCollapsed()}
                  >
                    <i
                      className={`fa fa-${this.state.annotationsCollapsed ? 'plus' : 'minus'}`}
                      aria-hidden='true'
                    ></i>
                  </Button>
                </CardHeader>
                <Collapse isOpen={!this.state.annotationsCollapsed}>
                  <CardBody className="py-2">
                    <FieldArray
                      name={`${entry}.annotations`}
                      component={RenderAnnotations}
                    />
                  </CardBody>
                </Collapse>
              </Card>
            </Col>
          </Row>

          <Row className="mb-2">
            <Col>
              <Card>
                <CardHeader className="py-2"><span>Rules</span></CardHeader>
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
  }
}

class RenderEntries extends Component {
  render() {
    const {
      ingressClasses,
      ingressHostKeys,
      initialEntryValues,
      fields,
      service,
    } = this.props;
    return (
      <Row>
        <Col>
          {fields.map((entry, index) => {
            const entryData = fields.get(index);
            return (
              <RenderEntry
                entryData={entryData}
                entry={entry}
                index={index}
                key={index}
                ingressClasses={ingressClasses}
                ingressHostKeys={ingressHostKeys}
                fields={fields}
              />
            );
          })}
          <Row>
            <Col>
              <Button
                outline
                className="pull-right"
                onClick={() => {
                  fields.push({
                    ...initialEntryValues,
                    name: `${service.name}-${nanoid()}`,
                    ingressClass: ingressClasses[0] ? ingressClasses[0].value : '',
                  });
                }}
              >Add entry
              </Button>
            </Col>
          </Row>
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
      service,
      meta,
      initialEntryValues,
      canManage,
      team,
      canWriteIngress,
      handleSubmit,
      submitForm,
    } = this.props;

    if (meta.loading.loadingPercent !== 100) return (
      <Row className="page-frame d-flex justify-content-center">
        <Col sm="12" className="mt-5">
          <Progress animated color="info" value={meta.loading.loadingPercent} />
        </Col>
      </Row>
    );

    if (!canWriteIngress) {
      return (
        <Row className="page-frame">
          <Row>
            <Col xs="12">
              <p>You are not authorised to view this page.</p>
            </Col>
          </Row>
        </Row>
      );
    }

    return (
      <Row className="page-frame">
        <Col>
          <Title title={`New ingress version `}/>
          <ServicesSubNav
            registryName={service.registry.name}
            serviceName={service.name}
            newIngress
            canManage={canManage}
            team={team}
          />

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
              <Col sm="2">
                <Button
                  className="pull-right"
                  color="dark"
                  onClick={handleSubmit(submitForm)}
                >Save</Button>
              </Col>
            </Row>
            <Row>
              <Col>
                <FieldArray
                  name="entries"
                  component={RenderEntries}
                  ingressClasses={ingressClasses}
                  ingressHostKeys={ingressHostKeys}
                  initialEntryValues={initialEntryValues}
                  service={service}
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

import React, { Component } from 'react';
import { Field, FieldArray, FormSection } from 'redux-form';
import { toString as humanCron } from 'cronstrue';
import { isValidCron } from 'cron-validator';
// import PropTypes from 'prop-types';
import {
  Row,
  Col,
  Form,
  FormGroup,
  Label,
  Card,
  CardHeader,
  CardBody,
  Collapse,
  Button,
  Progress,
} from 'reactstrap';
import Title from '../Title';
import { JobSubNav } from '../SubNavs';
import RenderInput from '../RenderInput';
import RenderSelect from '../RenderSelect';
import SecretEditor from '../SecretEditor';
import Popover from '../Popover';

const help = {
  schedule: {
    body: 'How often you want the job to run. Standard cron syntax.',
  },
  concurrency: {
    body: 'How should kubernetes handle the scenario of multiple instances of a job running at once.'
  },
  envFrom: {
    body: 'Inject the job secret as environment variables to this container.'
  },
  command: {
    body: 'The command run by the container (overriding "entrypoint").'
  },
  argument: {
    body: 'Arguments to be passed to the command (overriden or otherwise).'
  },
  volumeType: {
    body: 'Defines the source of the volume. `configMap` will require an existing configMap. Secret will use this job\'s secret definition. `emptyDir` will provide an unpopulated scratch space, perhaps for use between containers.',
  },
  resources: {
    body: 'These are constraints applied to the container. When you specify a resource limit for a Container, the kubelet enforces those limits so that the running container is not allowed to use more of that resource than the limit you set. The kubelet also reserves at least the request amount of that system resource specifically for that container to use.',
  },
  resources_cpu: {
    body: 'Format of "100m". Think of it like milliseconds of cpu time, where 1000 would therefore mean utilising an entire cpu core.'
  },
  resources_memory: {
    body: 'Measured in bytes, you can express memory as a plain integer or as a fixed-point integer using one of these suffixes: E, P, T, G, M, K.'
  },
};

class RenderArgs extends Component {
  render() {
    if (!this.props.fields.length) return (
      <Button
        outline
        onClick={() => this.props.fields.push('')}
      >Add argument options <Popover {...help.argument} classNames="d-inline" /></Button>
    );

    return (
      <Card>
        <CardHeader><span>Args:</span> <Popover {...help.argument} classNames="d-inline" /></CardHeader>
        <CardBody>
          <Row>
            <Col>
              {this.props.fields.map((arg, index) => {
                return (
                  <FormGroup row key={arg}>
                    <Label sm="3" className="text-right" for={arg}>Argument:</Label>
                    <Col sm="8">
                      <Field
                        className="form-control"
                        name={arg}
                        component={RenderInput}
                        type="text"
                        autoComplete="off"
                        onChangeListener={this.props.onChangeListener}
                        />
                    </Col>
                    <Col>
                      <Button
                        close
                        onClick={() => this.props.fields.remove(index)}
                        >
                          <i
                            className="fa fa-trash text-danger"
                            aria-hidden='true'
                          ></i>
                      </Button>
                    </Col>
                  </FormGroup>
                );
              })}
            </Col>
          </Row>
          <Row>
            <Col>
              <Button
                close
                onClick={() => {
                  this.props.fields.push('');
                  this.props.onChangeListener();
                }}
              >
                <i
                  className="fa fa-plus"
                  aria-hidden='true'
                ></i>
              </Button>
            </Col>
          </Row>
        </CardBody>
      </Card>
    );
  }
}

class RenderCommands extends Component {
  render() {
    if (!this.props.fields.length) return (
      <Button
        outline
        onClick={() => this.props.fields.push('')}
      >Add command options <Popover {...help.command} classNames="d-inline" /></Button>
    );

    return (
      <Card>
        <CardHeader><span>Command:</span> <Popover {...help.command} classNames="d-inline" /></CardHeader>
        <CardBody>
          <Row>
            <Col>
              {this.props.fields.map((command, index) => {
                return (
                  <FormGroup row key={command}>
                    <Label sm="3" className="text-right" for={command}>Command:</Label>
                    <Col sm="8">
                      <Field
                        className="form-control"
                        name={command}
                        component={RenderInput}
                        type="text"
                        autoComplete="off"
                        onChangeListener={this.props.onChangeListener}
                        />
                    </Col>
                    <Col>
                      <Button
                        close
                        onClick={() => {
                          this.props.fields.remove(index);
                          this.props.onChangeListener();
                        }}
                        >
                          <i
                            className="fa fa-trash text-danger"
                            aria-hidden='true'
                          ></i>
                      </Button>
                    </Col>
                  </FormGroup>
                );
              })}
            </Col>
          </Row>
          <Row>
            <Col>
              <Button
                close
                onClick={() => {
                  this.props.fields.push('');
                  this.props.onChangeListener();
                }}
              >
                <i
                  className="fa fa-plus"
                  aria-hidden='true'
                ></i>
              </Button>
            </Col>
          </Row>
        </CardBody>
      </Card>
    );
  }
}

class RenderVolumeMounts extends Component {
  render() {
    return (
      <Row>
        <Col>
          <Row>
            <Col>
              {this.props.fields.map((volumeMount, index) => {
                return (
                <Card key={volumeMount}>
                  <CardHeader>
                    <span>Volume mount:</span>
                    <Button
                      close
                      onClick={() => {
                        this.props.fields.remove(index);
                        this.props.onChangeListener();
                      }}
                      >
                      <i
                        className="fa fa-trash text-danger"
                        aria-hidden='true'
                        ></i>
                    </Button>
                  </CardHeader>
                  <CardBody>
                    <Row>
                      <Col>
                        <FormGroup row >
                          <Label sm="3" className="text-right" for={`${volumeMount}.mountPath`}>Mount path:</Label>
                          <Col sm="9">
                            <Field
                              className="form-control"
                              name={`${volumeMount}.mountPath`}
                              component={RenderInput}
                              type="text"
                              autoComplete="off"
                              onChangeListener={this.props.onChangeListener}
                            />
                          </Col>
                        </FormGroup>
                        <FormGroup row >
                          <Label sm="3" className="text-right" for={`${volumeMount}.name`}>name:</Label>
                          <Col sm="9">
                            <Field
                              className="form-control"
                              name={`${volumeMount}.name`}
                              component={RenderSelect}
                              autoComplete="off"
                              options={this.props.availbleVolumes.filter(v => v.name).map(v => v.name)}
                              onChangeListener={this.props.onChangeListener}
                            />
                          </Col>
                        </FormGroup>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
              );
            })}
          </Col>
        </Row>
        <Row>
          <Col>
            <Button
              outline
              onClick={() => {
                this.props.fields.push({});
                this.props.onChangeListener();
              }}
              >Add volume mount</Button>
          </Col>
        </Row>
      </Col>
    </Row>
    );
  }
}

class RenderContainers extends Component {
  render() {
    return (
      <Row>
        <Col>
          <Row>
            <Col>
              {this.props.fields.map((container, index) => {
                return (
                  <Row key={container} className="mb-2">
                    <Col>
                      <Card>
                        <CardBody>
                          <Button
                            close
                            onClick={() => {
                              this.props.fields.remove(index);
                              this.props.onChangeListener();
                            }}
                            >
                            <i
                              className="fa fa-trash text-danger"
                              aria-hidden='true'
                              ></i>
                          </Button>

                          <Row className="mb-2">
                            <Col>
                              <FormGroup row>
                                <Label sm="2" className="text-right" for={`${container}.name`}>Name:</Label>
                                <Col sm="5">
                                  <Field
                                    className="form-control"
                                    name={`${container}.name`}
                                    component={RenderInput}
                                    type="text"
                                    autoComplete="off"
                                    onChangeListener={this.props.onChangeListener}
                                  />
                                </Col>
                              </FormGroup>
                              <FormGroup row>
                                <Label sm="2" className="text-right" for={`${container}.image`}>Image:</Label>
                                <Col sm="8">
                                  <Field
                                    className="form-control"
                                    name={`${container}.image`}
                                    component={RenderInput}
                                    type="text"
                                    autoComplete="off"
                                    onChangeListener={this.props.onChangeListener}
                                  />
                                </Col>
                              </FormGroup>
                              <FormGroup row>
                                <Label sm="3" className="text-right" for={`${container}.envFromSecret`}>envFrom (use secret): <Popover {...help.envFrom} classNames="d-inline" /></Label>
                                <Col sm="6">
                                  <Field
                                    className="form-control"
                                    name={`${container}.envFromSecret`}
                                    component={RenderInput}
                                    type="checkbox"
                                    autoComplete="off"
                                    onChangeListener={this.props.onChangeListener}
                                  />
                                </Col>
                              </FormGroup>
                            </Col>
                          </Row>

                          <Row className="mb-2">
                            <Col md="10">
                              <Card>
                                <CardHeader>
                                  <span>Resources: <Popover {...help.resources} classNames="d-inline" /></span>
                                  <Button
                                    close
                                    onClick={() => this.props.rfChange(`${container}.resources.collapsed`, !this.props.fields.get(index).resources.collapsed)}
                                    >
                                    <i
                                      className={`fa fa-${this.props.fields.get(index).resources.collapsed ? 'plus' : 'minus'}`}
                                      aria-hidden='true'
                                      ></i>
                                  </Button>
                                </CardHeader>
                                <Collapse isOpen={!this.props.fields.get(index).resources.collapsed}>
                                  <CardBody>
                                    <Row form>
                                      <Col sm="6">
                                        <FormGroup>
                                          <Label for={`${container}.resources.requests.cpu`}>Requested CPU <Popover {...help.resources_cpu} classNames="d-inline" /></Label>
                                          <Field
                                            className="form-control"
                                            name={`${container}.resources.requests.cpu`}
                                            component={RenderInput}
                                            type="text"
                                            autoComplete="off"
                                            onChangeListener={this.props.onChangeListener}
                                            />
                                        </FormGroup>
                                      </Col>
                                      <Col sm="6">
                                        <FormGroup>
                                          <Label for={`${container}.resources.requests.memory`}>Requested Memory <Popover {...help.resources_memory} classNames="d-inline" /></Label>
                                          <Field
                                            className="form-control"
                                            name={`${container}.resources.requests.memory`}
                                            component={RenderInput}
                                            type="text"
                                            autoComplete="off"
                                            onChangeListener={this.props.onChangeListener}
                                            />
                                        </FormGroup>
                                      </Col>
                                    </Row>
                                    <Row form>
                                      <Col sm="6">
                                        <FormGroup>
                                          <Label for={`${container}.resources.limits.cpu`}>CPU limit <Popover {...help.resources_cpu} classNames="d-inline" /></Label>
                                          <Field
                                            className="form-control"
                                            name={`${container}.resources.limits.cpu`}
                                            component={RenderInput}
                                            type="text"
                                            autoComplete="off"
                                            onChangeListener={this.props.onChangeListener}
                                            />
                                        </FormGroup>
                                      </Col>
                                      <Col sm="6">
                                        <FormGroup>
                                          <Label for={`${container}.resources.limits.memory`}>Memory limit <Popover {...help.resources_memory} classNames="d-inline" /></Label>
                                          <Field
                                            className="form-control"
                                            name={`${container}.resources.limits.memory`}
                                            component={RenderInput}
                                            type="text"
                                            autoComplete="off"
                                            onChangeListener={this.props.onChangeListener}
                                            />
                                        </FormGroup>
                                      </Col>
                                    </Row>
                                  </CardBody>
                                </Collapse>
                              </Card>
                            </Col>
                          </Row>

                          <Row className="mb-2">
                            <Col md="10">
                              <FieldArray
                                name={`${container}.command`}
                                component={RenderCommands}
                                onChangeListener={this.props.onChangeListener}
                              />
                            </Col>
                          </Row>

                          <Row className="mb-2">
                            <Col md="10">
                              <FieldArray
                                name={`${container}.args`}
                                component={RenderArgs}
                                onChangeListener={this.props.onChangeListener}
                              />
                            </Col>
                          </Row>

                          <Row className="mb-2">
                            <Col md="10">
                              <FieldArray
                                name={`${container}.volumeMounts`}
                                component={RenderVolumeMounts}
                                availbleVolumes={this.props.availbleVolumes}
                                onChangeListener={this.props.onChangeListener}
                              />
                            </Col>
                          </Row>

                        </CardBody>
                      </Card>
                    </Col>
                  </Row>
                );
              })}
            </Col>
          </Row>
          <Row>
            <Col>
              <Button
                outline
                className="pull-right"
                onClick={() => {
                  this.props.fields.push(this.props.initialContainerValues);
                  this.props.onChangeListener();
                }}
                >Add container</Button>
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }
}

class RenderVolumes extends Component {
  render() {
    return (
      <Row>
        <Col>
          <Row>
            <Col>
              {this.props.fields.map((volume, index) => {
                return (
                  <Row key={volume} className="mb-2">
                    <Col>
                      <Card>
                        <CardBody>
                          <Button
                            close
                            onClick={() => {
                              this.props.fields.remove(index);
                              this.props.onChangeListener();
                            }}
                            >
                            <i
                              className="fa fa-trash text-danger"
                              aria-hidden='true'
                              ></i>
                          </Button>

                          <Row className="mb-2">
                            <Col>
                              <FormGroup row>
                                <Label sm="2" className="text-right" for={`${volume}.name`}>Name:</Label>
                                <Col sm="5">
                                  <Field
                                    className="form-control"
                                    name={`${volume}.name`}
                                    component={RenderInput}
                                    type="text"
                                    autoComplete="off"
                                    onChangeListener={this.props.onChangeListener}
                                    />
                                </Col>
                              </FormGroup>
                              <FormGroup row>
                                <Label sm="2" className="text-right" for={`${volume}.type`}>Type: <Popover {...help.volumeType} classNames="d-inline" /></Label>
                                <Col sm="5">
                                  <Field
                                    className="form-control"
                                    name={`${volume}.type`}
                                    component={RenderSelect}
                                    autoComplete="off"
                                    options={['emptyDir', 'configMap', 'secret']}
                                    onChangeListener={this.props.onChangeListener}
                                    />
                                </Col>
                              </FormGroup>
                              {
                                this.props.fields.get(index).type === 'configMap' ? (
                                  <FormGroup row>
                                    <Label sm="2" className="text-right" for={`${volume}.configMap.name`}>Config Map name:</Label>
                                    <Col sm="5">
                                      <Field
                                        className="form-control"
                                        name={`${volume}.configMap.name`}
                                        component={RenderInput}
                                        type="text"
                                        autoComplete="off"
                                        onChangeListener={this.props.onChangeListener}
                                        />
                                    </Col>
                                  </FormGroup>
                                ) : null
                              }
                            </Col>
                          </Row>
                        </CardBody>
                      </Card>
                    </Col>
                  </Row>
                );
              })}
            </Col>
          </Row>
          <Row>
            <Col>
              <Button
                outline
                className="pull-right"
                onClick={() => {
                  this.props.fields.push({});
                  this.props.onChangeListener();
                }}
                >Add volume</Button>
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }
}

class RenderLabels extends Component {
  render() {
    return (
      <Row>
        <Col>
          {this.props.fields.map((label, index) => (
            <Row form key={this.props.fields.get(index).tempKey}>
              <Col>
                <FormGroup className="row no-gutters" key={label}>
                  <Col sm="3" className="d-flex">
                    <Field
                      name={`${label}.key`}
                      className="form-control"
                      component={RenderInput}
                      type="text"
                      autocomplete="off"
                      placeholder="key"
                      onChangeListener={this.props.onChangeListener}
                    />
                  <span>:</span>
                  </Col>
                  <Col sm="3">
                    <Field
                      name={`${label}.value`}
                      className="form-control"
                      component={RenderInput}
                      type="text"
                      autoComplete="off"
                      placeholder="value"
                      onChangeListener={this.props.onChangeListener}
                      />
                  </Col>
                  <Col sm="1">
                    <Button
                      outline
                      color="danger"
                      onClick={(e) => { e.preventDefault(); this.props.fields.remove(index); }}
                      ><i className={`fa fa-trash`} aria-hidden='true'></i>
                    </Button>
                  </Col>
                  { index + 1 === this.props.fields.length ?
                    <Col sm="3">
                      <Button
                        color="light"
                        onClick={(e) => { e.preventDefault(); this.props.fields.push({ tempKey: Math.random() }); }}
                        >Add new label
                      </Button>
                    </Col>
                    : null }
              </FormGroup>
              </Col>
            </Row>
          ))}
          <Row>
            { this.props.fields.length === 0 ?
              <Col sm="3">
                <Button
                  color="light"
                  onClick={(e) => { e.preventDefault(); this.props.fields.push({ tempKey: Math.random() }); }}
                  >Add new label
                </Button>
              </Col>
            : null}
          </Row>
        </Col>
      </Row>
    );
  }
}

class NewJobVersionPage extends Component {

  render() {
    const {
      meta,
      job,
      secretErrors,
      change: rfChange,
      initialContainerValues,
    } = this.props;

    if (meta.loading.loadingPercent !== 100) return (
        <Row className="page-frame d-flex justify-content-center">
          <Col sm="12" className="mt-5">
            <Progress animated color="info" value={meta.loading.loadingPercent} />
          </Col>
        </Row>
    );

    if (!this.props.canEdit) {
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

    const availbleVolumes = this.props.currentFormValues.volumes || [];

    let humanCronValue = '';
    try {
      if (!this.props.currentFormSyncErrors.schedule && this.props.currentFormValues.schedule) humanCronValue = humanCron(this.props.currentFormValues.schedule);
    } catch (err) {
      console.error(err); // eslint-disable-line no-console
    }

    return (
      <Row className="page-frame">
        <Col>
          <Title title={`New version of cronjob: ${job.name}`}/>
          <JobSubNav job={job} newVersion />

          <Form>
            <Row className="mb-2">
              <Col md="6">
                <FormGroup row>
                  <Label sm="5" className="text-right" for="schedule">Schedule: <Popover {...help.schedule} classNames="d-inline" /></Label>
                  <Col sm="7">
                    <Field
                      className="form-control"
                      name="schedule"
                      component={RenderInput}
                      type="text"
                      autoComplete="off"
                      onChangeListener={() => this.props.triggerPreview()}
                      validate={(value) => {
                        if (!value) return 'Invalid cron syntax';
                        return isValidCron(value, { alias: true }) ? undefined : 'Invalid cron syntax';
                      }}
                      />
                    <span>{humanCronValue}</span>
                  </Col>
                </FormGroup>
                <FormGroup row>
                  <Label sm="5" className="text-right" for="concurrencyPolicy">Concurrency policy: <Popover {...help.concurrency} classNames="d-inline" /></Label>
                  <Col sm="7">
                    <Field
                      className="form-control"
                      name="concurrencyPolicy"
                      component={RenderSelect}
                      autoComplete="off"
                      options={['Allow', 'Forbid', 'Replace']}
                      onChangeListener={() => this.props.triggerPreview()}
                      />
                  </Col>
                </FormGroup>
              </Col>
              <Col>
                <Button
                  className="pull-right"
                  color="dark"
                  onClick={this.props.handleSubmit(this.props.submitForm)}
                >Save</Button>
              </Col>
            </Row>

            <Row className="mb-2">
              <Col>
                <Card>
                  <CardHeader>
                    <span>Labels:</span>
                    <Button
                      close
                      onClick={() => this.props.toggleCollapsed('labels')}
                      >
                      <i
                        className={`fa fa-${this.props.collapsed.labels ? 'plus' : 'minus'}`}
                        aria-hidden='true'
                        ></i>
                    </Button>
                  </CardHeader>
                  <Collapse isOpen={!this.props.collapsed.labels}>
                    <CardBody>
                      <FieldArray
                        name="labels"
                        component={RenderLabels}
                        onChangeListener={() => this.props.triggerPreview()}
                        />
                    </CardBody>
                  </Collapse>
                </Card>
              </Col>
            </Row>

            <Row className="mb-2">
              <Col>
                <Card>
                  <CardHeader>
                    <span>Init Containers:</span>
                    <Button
                      close
                      onClick={() => this.props.toggleCollapsed('initContainers')}
                      >
                      <i
                        className={`fa fa-${this.props.collapsed.initContainers ? 'plus' : 'minus'}`}
                        aria-hidden='true'
                        ></i>
                    </Button>
                  </CardHeader>
                  <Collapse isOpen={!this.props.collapsed.initContainers}>
                    <CardBody>
                      <FieldArray
                        name="initContainers"
                        component={RenderContainers}
                        availbleVolumes={availbleVolumes}
                        onChangeListener={() => this.props.triggerPreview()}
                        rfChange={rfChange}
                        initialContainerValues={initialContainerValues}
                      />
                    </CardBody>
                  </Collapse>
                </Card>
              </Col>
            </Row>

            <Row className="mb-2">
              <Col>
                <Card>
                  <CardHeader>
                    <span>Containers:</span>
                    <Button
                      close
                      onClick={() => this.props.toggleCollapsed('containers')}
                      >
                      <i
                        className={`fa fa-${this.props.collapsed.containers ? 'plus' : 'minus'}`}
                        aria-hidden='true'
                        ></i>
                    </Button>
                  </CardHeader>
                  <Collapse isOpen={!this.props.collapsed.containers}>
                    <CardBody>
                      <FieldArray
                        name="containers"
                        component={RenderContainers}
                        availbleVolumes={availbleVolumes}
                        onChangeListener={() => this.props.triggerPreview()}
                        rfChange={rfChange}
                        initialContainerValues={initialContainerValues}
                      />
                    </CardBody>
                  </Collapse>
                </Card>
              </Col>
            </Row>

            <Row className="mb-2">
              <Col>
                <Card>
                  <CardHeader>
                    <span>Volumes:</span>
                    <Button
                      close
                      onClick={() => this.props.toggleCollapsed('volumes')}
                      >
                      <i
                        className={`fa fa-${this.props.collapsed.volumes ? 'plus' : 'minus'}`}
                        aria-hidden='true'
                        ></i>
                    </Button>
                  </CardHeader>
                  <Collapse isOpen={!this.props.collapsed.volumes}>
                    <CardBody>
                      <FieldArray
                        name="volumes"
                        component={RenderVolumes}
                        onChangeListener={() => this.props.triggerPreview()}
                        />
                    </CardBody>
                  </Collapse>
                </Card>
              </Col>
            </Row>

            <Row className="mb-2">
              <Col>
                <Card>
                  <CardHeader>
                    <span>Secret:</span>
                    <Button
                      close
                      onClick={() => this.props.toggleCollapsed('secret')}
                      >
                      <i
                        className={`fa fa-${this.props.collapsed.secret ? 'plus' : 'minus'}`}
                        aria-hidden='true'
                        ></i>
                    </Button>
                  </CardHeader>
                  <Collapse isOpen={!this.props.collapsed.secret}>
                    <CardBody>
                      <FormSection name="secret">
                        <SecretEditor
                          secretErrors={secretErrors}
                          formSecrets={this.props.formSecrets}
                          formValues={this.props.currentFormValues.secret || {}}
                          addSecret={this.props.addSecret}
                          saveVersion={this.props.saveVersion}
                          removeSecret={this.props.removeSecret}
                          validateAnnotations={this.props.validateAnnotations}
                          height="small"
                        />
                      </FormSection>
                    </CardBody>
                  </Collapse>
                </Card>
              </Col>
            </Row>

          </Form>

          <Row>
            <Col>
              <h5>Yaml preview:</h5>
              <pre className="bg-light p-2">
                <code>
                  {this.props.preview}
                </code>
              </pre>
            </Col>
          </Row>

        </Col>
      </Row>
    );
  }
}

NewJobVersionPage.propTypes = {

};

export default NewJobVersionPage;

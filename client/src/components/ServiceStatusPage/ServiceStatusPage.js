import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Row,
  Col,
  Progress,
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  Label,
  Table,
} from 'reactstrap';
import { Field } from 'redux-form';
import Title from '../Title';
import { ServicesSubNav } from '../SubNavs';
import { Ago } from '../DisplayDate';
import RenderNamespaces from '../RenderNamespaces';

class LogsContainer extends Component {
  componentDidMount() {
    if (this.refs.current) this.refs.current.scrollTop = this.refs.current.scrollHeight;
    if (this.refs.previous) this.refs.previous.scrollTop = this.refs.previous.scrollHeight;
  }

  render() {
    const {
      name,
      logs,
    } = this.props;

    const logStyles = { overflowY: 'scroll', maxHeight: '150px' };

    return (
      <Row className="bg-light mb-2">
        <Col className="p-2">
          <h6>Container: {name}</h6>
          {
            logs.current ? (
              <div className="mb-2">
                <div className="mb-1">Current logs (last 30 lines):</div>
                <pre className="bg-white p-2" ref="current" style={logStyles}>{logs.current}</pre>
              </div>
            ) : null
          }
          {
            logs.previous ? (
              <div className="mb-2">
                <div className="mb-1">Logs prior to restart (last 30 lines):</div>
                <pre className="bg-white p-2" ref="previous" style={logStyles}>{logs.previous}</pre>
              </div>
            ) : null
          }
        </Col>
      </Row>
    );
  }
}

class PodEvents extends Component {
  render() {
    if (!this.props.events || !this.props.events.length) return null;
    return (
      <Row>
        <Col>
          <div>Recent pod events:</div>
          <Table hover responsive size="sm">
            <thead>
              <tr>
                <th>Type</th>
                <th>Reason</th>
                <th>Age</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {this.props.events.map(e => (
                <tr>
                  <td>{e.type}</td>
                  <td>{e.reason}</td>
                  <td><Ago date={e.metadata.creationTimestamp} /></td>
                  <td>{e.message}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    );
  }
}

class Pod extends Component {
  render() {
    const {
      name,
      status,
      restarts,
      createdAt,
      logsPerContainer,
      events,
    } = this.props;

    return (
      <Row className="mb-2">
        <Col>
          <Card>
            <CardHeader className="d-flex justify-content-between">
              <span><strong>Pod:</strong> {name}</span>
              <span><strong>Status:</strong> {status}</span>
              <span><strong>Restarts:</strong> {restarts}</span>
              <span><strong>Created:</strong> <Ago date={createdAt} /></span>
            </CardHeader>
            <CardBody>
              <PodEvents events={events} />
              {logsPerContainer.map((c) => (
                <LogsContainer {...c} key={c.name} />
              ))}
            </CardBody>
          </Card>
        </Col>
      </Row>
    );
  }
}

class ServiceStatusPage extends Component {

  render() {
    const { meta } = this.props;
    if (meta.loading.loadingPercent !== 100) return (
      <Row className="page-frame d-flex justify-content-center">
        <Col sm="12" className="mt-5">
          <Progress animated color="info" value={meta.loading.loadingPercent} />
        </Col>
      </Row>
    );

    return (
      <Row className="page-frame">
        <Col>
          <Title title={`Service status: ${this.props.registryName}/${this.props.serviceName}`} />
          <ServicesSubNav
            registryName={this.props.registryName}
            serviceName={this.props.serviceName}
            canManage={this.props.canManage}
            team={this.props.team}
            canReadIngress={this.props.canReadIngress}
          />
          <Row>
            <Col md="5">
              <FormGroup row>
                <Label sm="3" className="text-right" for="namespace">Namespace:</Label>
                <Col md="9">
                  <form>
                    <Field
                      className=""
                      name="namespace"
                      component={RenderNamespaces}
                      options={this.props.namespacesRich}
                      onChange={(evt, newValue) => {
                        this.props.changeToNamespace({
                          registry: this.props.registryName,
                          service: this.props.serviceName,
                          namespaceId: newValue
                        });
                      }}
                      />
                  </form>
                </Col>
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col>
              {this.props.status.map((pod) => (
                <Pod {...pod} key={pod.name} />
              ))}
            </Col>
          </Row>
          <div className="row d-block">

          </div>
        </Col>
      </Row>
    );
  }
}

ServiceStatusPage.propTypes = {
  registryName: PropTypes.string.isRequired,
  serviceName: PropTypes.string.isRequired,

  latestDeployments: PropTypes.array,
  canManage: PropTypes.bool,
  team: PropTypes.object,
  status: PropTypes.array.isRequired,
};

export default ServiceStatusPage;

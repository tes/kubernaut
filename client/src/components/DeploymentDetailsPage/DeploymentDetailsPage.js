import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import {
  Row,
  Col,
  Table,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Collapse,
  Card,
  CardHeader,
  CardBody,
} from 'reactstrap';
import { Field } from 'redux-form';
import Title from '../Title';
import RenderTextArea from '../RenderTextArea';
import { Human, Ago } from '../DisplayDate';
import DeploymentStatus from '../DeploymentStatus';
import Popover from '../Popover';
import { AccountLink, RegistryLink, ServiceLink, ReleaseLink, NamespaceLink } from '../Links';

class DeploymentDetailsPage extends Component {

  render() {
    const { meta = {}, deployment, canEdit, manifestOpen } = this.props;

    const errorDetails = () =>
      <div>Error loading deployments</div>
    ;

    const loadingDetails = () =>
      <div>Loading deployments</div>
    ;

    const deploymentDetails = () => {
      const attributesEls = [];

      for (const name in deployment.attributes) {
        attributesEls.push(<dt key={name} className='col-md-auto mr-2'>{name}:</dt>);
        if (name === 'secret' && typeof(deployment.attributes[name]) === 'object') {
          const secret = deployment.attributes[name];
          attributesEls.push(<dd key={`${name}-val`} className='col-md-auto'><pre style={{display: 'inline'}}>{secret.comment}</pre> - <AccountLink account={secret.createdBy} /></dd>);
        }
        else attributesEls.push(<dd key={`${name}-val`} className='col-md-auto'>{deployment.attributes[name]}</dd>);
        attributesEls.push(<div key={`${name}-spacer`}className="w-100"></div>); // Force new line
      }

      const logPending = deployment.status !== 'failed' && (deployment.applyExitCode === null || deployment.rolloutStatusExitCode === null || deployment.status === 'pending');

      return (
        <div>
          <Title title={`Deployment: ${deployment.release.service.name}@${deployment.release.version} -> ${deployment.namespace.cluster.name}/${deployment.namespace.name}`} />
          <Row className="mb-2">
            <Col md="8" sm="12">
              <Card>
                <CardHeader className="d-flex justify-content-between">
                  <span>
                    Deployment of <ServiceLink service={deployment.release.service} />@<ReleaseLink release={deployment.release} /> to <NamespaceLink namespace={deployment.namespace} pill showCluster />
                  </span>
                  <span><DeploymentStatus deployment={deployment}/></span>
                </CardHeader>
                <CardBody>
                  <dl className="row no-gutters">
                    <dt className='col-md-auto mr-2'>Registry:</dt>
                    <dd className='col-md-auto'><RegistryLink registry={deployment.release.service.registry} /></dd>
                    <div className="w-100"></div>
                    <dt className='col-md-auto mr-2'>Status:</dt>
                    <dd className='col-md-auto'>{deployment.status}</dd>
                    <div className="w-100"></div>
                    <dt className='col-md-auto mr-2'>Apply Exit Code:</dt>
                    <dd className='col-md-auto'>{deployment.applyExitCode}</dd>
                    <div className="w-100"></div>
                    <dt className='col-md-auto mr-2'>Rollout Status Exit Code:</dt>
                    <dd className='col-md-auto'>{deployment.rolloutStatusExitCode}</dd>
                    <div className="w-100"></div>
                    <dt className='col-md-auto mr-2'>Created On:</dt>
                    <dd className='col-md-auto'>
                      <span><Human date={deployment.createdOn} /></span>&nbsp;
                      <span>(<Ago date={deployment.createdOn} />)</span>
                    </dd>
                    <div className="w-100"></div>
                    <dt className='col-md-auto mr-2'>Created By:</dt>
                    <dd className='col-md-auto'><AccountLink account={deployment.createdBy} /></dd>
                    <div className="w-100"></div>
                  </dl>
                  { deployment.note ? (
                    <Row>
                      <Col>
                        <Row className="text-light bg-dark p-1 mb-1 no-gutters">
                          <Col>
                            <h4>Note:</h4>
                            <ReactMarkdown source={deployment.note} />
                          </Col>
                        </Row>
                        {
                          canEdit ? (
                            <Row>
                              <Col>
                                <Button onClick={() => this.props.openModal()} color="link">Edit note</Button>
                              </Col>
                            </Row>
                          ) : null
                        }
                      </Col>
                    </Row>
                  ) : canEdit ? (
                      <Row>
                        <Col>
                          <Button onClick={() => this.props.openModal()} color="link">Add note</Button>
                        </Col>
                      </Row>
                    ) : null
                  }
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col sm="10">
              <h4 className="d-flex">
                Deployment Log
                <Popover title="Log output" classNames="pl-1">
                  <p className="text-info">stdin</p>
                  <p className="text-secondary">stdout</p>
                  <p className="text-danger">stderr</p>
                </Popover>
              </h4>
            </Col>
          </Row>
          <Row>
            <Col sm="12">
              <Table hover responsive size="sm">
                <tbody>
                  {
                    deployment.log.map(entry => {
                      let textClass = 'text-secondary';
                      if (entry.writtenTo === 'stdin') textClass = 'text-info';
                      if (entry.writtenTo === 'stderr') textClass = 'text-danger';
                      return <tr key={entry.id}>
                        <td><Human date={entry.writtenOn} /></td>
                        <td className={textClass}>{entry.content}</td>
                      </tr>;
                    })
                  }
                  {
                    logPending ? <tr className="text-center"><td colSpan="2"><i className="fa fa-spinner fa-pulse" aria-hidden='true' /></td></tr> : null
                  }
                </tbody>
              </Table>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md="8" sm="12">
              <Card>
                <CardHeader>
                  <span>Attributes:</span>
                </CardHeader>
                <CardBody>
                  <dl className="row no-gutters">
                    {attributesEls}
                  </dl>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col sm="12" className="d-flex mb-2">
              <h4 className="mr-2">Kubernetes Manifest</h4>
              <Button
                onClick={() => this.props.toggleManifestOpen()}
              >{manifestOpen ? 'Hide' : 'Show'}</Button>
            </Col>
          </Row>
          <Row>
            <Col sm="10">
              <Collapse isOpen={manifestOpen}>
                <pre className="bg-light p-2">
                  <code>
                    {deployment.manifest.yaml}
                  </code>
                </pre>
              </Collapse>
            </Col>
          </Row>

          <Modal
            isOpen={this.props.modalOpen}
            toggle={this.props.closeModal}
            size="lg"
          >
            <form onSubmit={this.props.handleSubmit((values, dispatch) => {
                this.props.submitNoteForm({
                  id: deployment.id,
                  ...values
                }, dispatch);
              })}>
              <ModalHeader>
                Edit deployment note:
              </ModalHeader>
              <ModalBody>
                <Field
                  name="note"
                  component={RenderTextArea}
                  className="form-control"
                  rows="6"
                />
              </ModalBody>
              <ModalFooter>
                <Button
                  type="submit"
                >Save</Button>
              </ModalFooter>
            </form>
          </Modal>
        </div>
      );
    };

    return (
      <Row className="page-frame">
        <Col>
          {
            (() => {
              if (meta.error) return errorDetails();
              else if (meta.loading || !deployment) return loadingDetails();
              else return deploymentDetails();
            })()
          }
        </Col>
      </Row>
    );
  }
}

DeploymentDetailsPage.propTypes = {
  deployment: PropTypes.object,
};

export default DeploymentDetailsPage;

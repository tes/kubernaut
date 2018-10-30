import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';
import { Field } from 'redux-form';
import RenderTextArea from '../RenderTextArea';
import { Human, Ago } from '../DisplayDate';
import { AccountLink, RegistryLink, ServiceLink, ReleaseLink, ClusterLink, NamespaceLink } from '../Links';

class DeploymentDetailsPage extends Component {

  componentDidMount() {
    this.props.fetchDeployment({ id: this.props.deploymentId });
  }

  render() {
    const { meta = {}, deployment, canEdit } = this.props;

    const errorDetails = () =>
      <div>Error loading deployments</div>
    ;

    const loadingDetails = () =>
      <div>Loading deployments</div>
    ;

    const deploymentDetails = () => {
      const attributesEls = [];

      for (const name in deployment.attributes) {
        attributesEls.push(<dt key={name} className='col-md-3'>{name}:</dt>);
        attributesEls.push(<dd key={`${name}-val`}className='col-md-9'>{deployment.attributes[name]}</dd>);
      }

      return (
        <div>
          <Row>
            <Col sm="12">
              <dl className="row">
                  <dt className='col-md-3'>Service:</dt>
                  <dd className='col-md-9'><ServiceLink service={deployment.release.service} /></dd>
                  <dt className='col-md-3'>Version:</dt>
                  <dd className='col-md-9'><ReleaseLink release={deployment.release} /></dd>
                  <dt className='col-md-3'>Registry:</dt>
                  <dd className='col-md-9'><RegistryLink registry={deployment.release.service.registry} /></dd>
                  <dt className='col-md-3'>Cluster:</dt>
                  <dd className='col-md-9'><ClusterLink cluster={deployment.namespace.cluster} /></dd>
                  <dt className='col-md-3'>Namespace:</dt>
                  <dd className='col-md-9'><NamespaceLink namespace={deployment.namespace} /></dd>
                  <dt className='col-md-3'>Status:</dt>
                  <dd className='col-md-9'>{deployment.status}</dd>
                  <dt className='col-md-3'>Apply Exit Code:</dt>
                  <dd className='col-md-9'>{deployment.applyExitCode}</dd>
                  <dt className='col-md-3'>Rollout Status Exit Code:</dt>
                  <dd className='col-md-9'>{deployment.rolloutStatusExitCode}</dd>
                  <dt className='col-md-3'>Created On:</dt>
                  <dd className='col-md-9'>
                    <span><Human date={deployment.createdOn} /></span>&nbsp;
                    <span>(<Ago date={deployment.createdOn} />)</span>
                  </dd>
                  <dt className='col-md-3'>Created By:</dt>
                  <dd className='col-md-9'><AccountLink account={deployment.createdBy} /></dd>
                </dl>
              </Col>
            </Row>

            { deployment.note ? (
              <Row className="mb-3">
                <Col>
                  <Row className="text-light bg-dark py-1 mb-1">
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

            <Row>
              <Col sm="12">
                <h4>Deployment Attributes</h4>
              </Col>
            </Row>
            <dl className="row">
              {attributesEls}
            </dl>

            <Row>
              <Col sm="12">
                <h4>Deployment Log</h4>
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
                        if (entry.writtenTo === 'sterr') textClass = 'text-danger';
                        return <tr key={entry.id}>
                          <td><Human date={entry.writtenOn} /></td>
                          <td className={textClass}>{entry.content}</td>
                        </tr>;
                      })
                    }
                  </tbody>
                </Table>
              </Col>
            </Row>

            <Row>
              <Col sm="12">
                <h4>Kubernetes Manifest</h4>
              </Col>
            </Row>
            <Row>
              <Col sm="12">
                <pre className="bg-light p-2">
                  <code>
                    {deployment.manifest.yaml}
                  </code>
                </pre>
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
      <Container>
        <Row>
          <Col sm="12">
            <h3>Deployment Details:</h3>
          </Col>
        </Row>
        {
          (() => {
            if (meta.error) return errorDetails();
            else if (meta.loading || !deployment) return loadingDetails();
            else return deploymentDetails();
          })()
        }
      </Container>
    );
  }
}

DeploymentDetailsPage.propTypes = {
  deployment: PropTypes.object,
};

export default DeploymentDetailsPage;

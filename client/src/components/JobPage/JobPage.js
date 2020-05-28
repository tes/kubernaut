import React, { Component } from 'react';
import { Field } from 'redux-form';
import PropTypes from 'prop-types';
import {
  Row,
  Col,
  Table,
  Progress,
  Button,
  Card,
  CardHeader,
  CardBody,
  Modal,
  ModalHeader,
  ModalBody,
  FormGroup,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';
import Title from '../Title';
import { JobVersionLink, NewJobVersionLink } from '../Links';
import { JobSubNav } from '../SubNavs';
import TablePagination from '../TablePagination';
import { Ago } from '../DisplayDate';
import Popover from '../Popover';
import RenderInput from '../RenderInput';

class LogsContainer extends Component {
  componentDidMount() {
    if (this.refs.current) this.refs.current.scrollTop = this.refs.current.scrollHeight;
  }

  render() {
    const {
      name,
      logs,
    } = this.props;

    const logStyles = { overflowY: 'scroll', maxHeight: '150px' };

    return (
      <Row className="bg-light mb-2" key={name}>
        <Col className="p-2">
          <h6>Container: {name}</h6>
          {
            logs.current ? (
              <div className="mb-2">
                <div className="mb-1">Logs (last 30 lines):</div>
                <pre className="bg-white p-2" ref="current" style={logStyles}>{logs.current}</pre>
              </div>
            ) : null
          }
        </Col>
      </Row>
    );
  }
}

class JobPage extends Component {

  render() {
    const job = this.props.job.data;
    const {
      versions,
      snapshot,
      meta,
      canEdit,
      canApply,
      editDescription,
      editDescriptionOpen,
      submitDescription,
    } = this.props;

    const showPause = canApply;
    const showDelete = canEdit && canApply;
    const showRunNow = versions.data.count && canApply;
    const showMenu = showPause || showDelete || showRunNow;

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
          <Title title={`CronJob: ${job.name}`}/>
          <JobSubNav job={job} />

          <Row>
            <Col md="8">
              { editDescriptionOpen ? (
                <FormGroup row>
                  <Col md="9">
                    <Field
                      className="form-control"
                      name="description"
                      component={RenderInput}
                      type="text"
                      autoComplete="off"
                    />
                  </Col>
                  <Col>
                    <Button className="pull-right" outline onClick={() => submitDescription()}>Save</Button>
                  </Col>
                </FormGroup>
              ) : ( job.description ? (
                  <div>
                    <span>{job.description} <i className="fa fa-edit clickable" onClick={() => editDescription()}></i></span>
                    <hr />
                  </div>
                ) : (
                  <div>
                    <span>Why not <a href="" onClick={(e) => {e.preventDefault(); editDescription();}}>add</a> a description</span>
                    <hr />
                  </div>
                )
              )}

              {
                snapshot ? (
                  <Card>
                    <CardHeader className="d-flex justify-content-between">
                      <span>Most recent execution: {snapshot.name}</span>
                      <span><Ago date={snapshot.createdAt} /></span>
                    </CardHeader>
                    <CardBody className="py-1">
                      {
                        snapshot && snapshot.logsPerInitContainer.length ? (
                          <Row>
                            <Col>
                              <Row>
                                <Col className="p-2">
                                  <div className="mb-1">Init containers:</div>
                                </Col>
                              </Row>
                              {
                                snapshot.logsPerInitContainer.map(c => <LogsContainer {...c} key={c.name} />)
                              }
                              <hr />
                            </Col>
                          </Row>
                        ) : null
                      }
                      {
                        snapshot && snapshot.logsPerContainer.length ? (
                          <Row>
                            <Col>
                              <Row>
                                <Col className="p-2">
                                  <div className="mb-1">Containers:</div>
                                </Col>
                              </Row>
                              {
                                snapshot.logsPerContainer.map(c => <LogsContainer {...c} key={c.name} />)
                              }
                            </Col>
                          </Row>
                        ) : null
                      }
                    </CardBody>
                  </Card>
                ) : null
              }
            </Col>
            <Col md="4">
              <Row className="mb-2">
                <Col className="d-flex justify-content-between">
                  {
                    canEdit ? (
                      <NewJobVersionLink
                        job={job}
                        >
                        <Button color="dark">
                          Create new version
                        </Button>
                      </NewJobVersionLink>
                    ): null
                  }
                  {
                    showMenu ? (
                      <UncontrolledDropdown>
                        <DropdownToggle caret outline color="dark">
                          <i className="fa fa-cog"></i>
                        </DropdownToggle>
                        <DropdownMenu right>
                          {
                            showRunNow ? (
                              <DropdownItem onClick={() => this.props.execute()}>
                                Run now <Popover title="What will this do?" body="It will immediately create a job based on the most recently applied configuration. In the event there isn't one, it will choose the latest available configuration." classNames="d-inline" placement='bottom' />
                              </DropdownItem>
                            ) : null
                          }
                          {
                            showPause ? (
                              <DropdownItem onClick={() => this.props.openStopModal()}>
                                <i className="fa fa-pause"></i> Pause/remove from cluster
                              </DropdownItem>
                            ) : null
                          }
                          <DropdownItem divider />
                          {
                            showDelete ? (
                              <DropdownItem className="text-danger" onClick={() => this.props.openDeleteModal()}>
                                <i className="fa fa-trash"></i> Delete
                              </DropdownItem>
                            ) : null
                          }
                        </DropdownMenu>
                      </UncontrolledDropdown>
                    ) : null
                  }
                </Col>
              </Row>
              <Row className="mt-3">
                <Col>
                  <h5>Configuration versions:</h5>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Table hover size="sm">
                    <thead>
                      <tr>
                        <th>Created</th>
                        <th className="text-center">Applied</th>
                      </tr>
                    </thead>
                    <tbody>
                    {
                      versions.data.items.map(version => (
                        <tr key={version.id}>
                          <td><JobVersionLink version={version} /></td>
                          <td className="text-center">
                            {
                              version.isLatestApplied ? (
                                <i className={`fa fa-${job.paused ? 'pause-circle' : 'circle'}`} aria-hidden='true'></i>
                              ) : version.lastApplied ? (
                                <i className="fa fa-circle-o" aria-hidden='true'></i>
                              ) : null
                            }
                          </td>
                        </tr>
                      ))
                    }
                    </tbody>
                  </Table>
                  <TablePagination
                    pages={versions.data.pages}
                    page={versions.data.page}
                    limit={versions.data.limit}
                    fetchContent={this.props.fetchVersionsPagination}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>
        <Modal
          isOpen={this.props.logOpen}
          toggle={this.props.closeModal}
          size="lg"
        >
          <ModalHeader>
            <span>Apply result log:</span>
          </ModalHeader>
          <ModalBody>
            {
              this.props.applyLog.map((line, idx) => (
                <pre key={`${idx}-${line.writtenOn}`}>
                  <code>
                    {line.content}
                  </code>
                </pre>
              ))
            }
            {this.props.applyError ? (
              <span>{this.props.applyError}</span>
            ): null}
          </ModalBody>
        </Modal>
        <Modal
          isOpen={this.props.deleteModalOpen}
          toggle={this.props.closeModal}
          size="lg"
        >
          <ModalHeader>
            <span>Delete job:</span>
          </ModalHeader>
          <ModalBody>
            <Row>
              <Col className="d-flex justify-content-between">
                <p>Are you sure?</p>
                <Button onClick={() => this.props.deleteJob()} color="danger" outline>Delete</Button>
              </Col>
            </Row>
          </ModalBody>
        </Modal>
        <Modal
          isOpen={this.props.stopModalOpen}
          toggle={this.props.closeModal}
          size="lg"
        >
          <ModalHeader>
            <span>Stop/pause further job execution:</span>
          </ModalHeader>
          <ModalBody>
            <Row>
              <Col>
                <p>This will remove the cronjob definition from the cluster therefore preventing further scheduled executions. Are you sure?</p>
                <Button
                  className="pull-right"
                  onClick={() => this.props.stopJob()}
                  color="danger"
                  outline
                >Pause/Remove</Button>
              </Col>
            </Row>
          </ModalBody>
        </Modal>
      </Row>
    );
  }
}

JobPage.propTypes = {
  job: PropTypes.object.isRequired,
  versions: PropTypes.object.isRequired,
  snapshot: PropTypes.object,
};

export default JobPage;

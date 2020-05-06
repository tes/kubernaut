import React, { Component } from 'react';
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
} from 'reactstrap';
import Title from '../Title';
import { JobVersionLink, NewJobVersionLink } from '../Links';
import { JobSubNav } from '../SubNavs';
import TablePagination from '../TablePagination';
import { Ago } from '../DisplayDate';

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
    const { versions, snapshot, meta } = this.props;

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
              {
                snapshot ? (
                  <Card>
                    <CardHeader className="d-flex justify-content-between">
                      <span>Most recent execution: {snapshot.name}</span>
                      <span><Ago date={snapshot.createdAt} /></span>
                    </CardHeader>
                    <CardBody className="py-1">
                      {
                        snapshot.logsPerInitContainer.length ? (
                          <Row>
                            <Col>
                              <Row>
                                <Col className="p-2">
                                  <div className="mb-1">Init containers:</div>
                                </Col>
                              </Row>
                              {
                                snapshot.logsPerInitContainer.map(c => <LogsContainer {...c} />)
                              }
                              <hr />
                            </Col>
                          </Row>
                        ) : null
                      }
                      {
                        snapshot.logsPerContainer.length ? (
                          <Row>
                            <Col>
                              <Row>
                                <Col className="p-2">
                                  <div className="mb-1">Containers:</div>
                                </Col>
                              </Row>
                              {
                                snapshot.logsPerContainer.map(c => <LogsContainer {...c} />)
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
                <Col>
                  <NewJobVersionLink
                    job={job}
                  >
                    <Button color="dark">
                      Create new version
                    </Button>
                  </NewJobVersionLink>
                </Col>
              </Row>
              <Row>
                <Col>
                  <h5>Versions:</h5>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Table hover size="sm">
                    <thead>
                      <tr>
                        <th>Created</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                    {
                      versions.data.items.map(version => (
                        <tr key={version.id}>
                          <td><JobVersionLink version={version} /></td>
                          <td>
                            {
                              version.isLatestApplied ? (
                                <i className="fa fa-circle" aria-hidden='true'></i>
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

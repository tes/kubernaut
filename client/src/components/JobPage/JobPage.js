import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Table, Progress, Button } from 'reactstrap';
import Title from '../Title';
import { JobVersionLink, NewJobVersionLink } from '../Links';
import { JobSubNav } from '../SubNavs';
import TablePagination from '../TablePagination';

class JobPage extends Component {

  render() {
    const job = this.props.job.data;
    const { versions, meta } = this.props;


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
};

export default JobPage;

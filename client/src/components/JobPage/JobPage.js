import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Table, Progress } from 'reactstrap';
import Title from '../Title';
import { RegistryLink, ServiceLink, AccountLink } from '../Links';
// import { TeamSubNav } from '../SubNavs';
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
          <Title title={`Job: ${job.name}`}/>

          <Row>
            <Col md="6">
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
                      </tr>
                    </thead>
                    <tbody>
                    {
                      versions.data.items.map(version => (
                        <tr key={version.id}>
                          <td>{version.createdOn}</td>
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

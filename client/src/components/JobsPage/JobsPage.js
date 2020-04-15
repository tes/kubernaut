import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'reactstrap';
import JobsTable from '../JobsTable';

class TeamsPage extends Component {

  render() {
    const { jobs, fetchJobsPagination } = this.props;

    return (
      <div className='page-frame'>
        <Row>
          <Col md="8">
            <JobsTable jobs={jobs.data} loading={jobs.meta.loading} error={jobs.meta.error} fetchJobs={fetchJobsPagination} />
          </Col>
        </Row>
      </div>
    );
  }
}

TeamsPage.propTypes = {
  jobs: PropTypes.object,
};

export default TeamsPage;

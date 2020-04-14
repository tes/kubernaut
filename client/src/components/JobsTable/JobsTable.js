import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table } from 'reactstrap';
import TablePagination from '../TablePagination';
import { JobLink, NamespaceLink } from '../Links';

class JobsTable extends Component {

  render() {
    const { error = null, loading = false, jobs = {}, fetchJobs } = this.props;

    const errorTableBody = () =>
      <tbody>
        <tr>
          <td colSpan='4'>Error loading jobs</td>
        </tr>
      </tbody>
    ;

    const loadingTableBody = () =>
      <tbody>
        <tr>
          <td colSpan='4'>Loading jobs…</td>
        </tr>
      </tbody>
    ;

    const emptyTableBody = () =>
      <tbody>
        <tr>
          <td colSpan='4'>There are no jobs</td>
        </tr>
      </tbody>
    ;

    const JobsTableBody = () =>
      <tbody>
      {
        jobs.items.map(job => {
          return <tr key={job.id} >
            <td><JobLink job={job} /></td>
            <td><NamespaceLink namespace={job.namespace} pill /></td>
          </tr>;
        })
      }
      </tbody>
    ;

    return (
      <div>
        <Table hover size="sm">
          <thead>
            <tr>
              <th>Name</th>
              <th>Namespace</th>
            </tr>
          </thead>
          {
            (() => {
              if (error) return errorTableBody();
              else if (loading) return loadingTableBody();
              else if (!jobs.count) return emptyTableBody();
              else return JobsTableBody();
            })()
          }
        </Table>
        <TablePagination
          pages={jobs.pages}
          page={jobs.page}
          limit={jobs.limit}
          fetchContent={fetchJobs}
        />
      </div>
    );
  }
}

JobsTable.propTypes = {
  error: PropTypes.object,
  loading: PropTypes.bool,
  jobs: PropTypes.shape({
    limit: PropTypes.number.isRequired,
    offset: PropTypes.number.isRequired,
    pages: PropTypes.number.isRequired,
    page: PropTypes.number.isRequired,
    count: PropTypes.number.isRequired,
    items: PropTypes.array.isRequired,
  }),
  fetchJobs: PropTypes.func,
};

export default JobsTable;

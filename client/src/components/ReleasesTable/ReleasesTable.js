import React, { Component, } from 'react';
import { Link, } from 'react-router-dom';
import PropTypes from 'prop-types';
import TablePagination from '../TablePagination';
import { Human, Ago, } from '../DisplayDate';
import './ReleasesTable.css';

class ReleasesTable extends Component {

  render() {
    const { error = null, loading = false, releases = {}, fetchReleases, } = this.props;

    const errorTableBody = () =>
      <tbody className='releases-table__body releases-table__body--error'>
        <tr className='releases-table__body__row'>
          <td className='releases-table__body__row__info' colSpan='5'>Error loading releases</td>
        </tr>
      </tbody>
    ;

    const loadingTableBody = () =>
      <tbody className='releases-table__body releases-table__body--loading'>
        <tr className='releases-table__body__row'>
          <td className='releases-table__body__row__info' colSpan='5'>Loading releases…</td>
        </tr>
      </tbody>
    ;

    const emptyTableBody = () =>
      <tbody className='releases-table__body releases-table__body--empty'>
        <tr className='releases-table__body__row'>
          <td className='releases-table__body__row__info' colSpan='5'>There are no releases</td>
        </tr>
      </tbody>
    ;

    const releasesTableBody = () =>
      <tbody className='releases-table__body releases-table__body--data'>
      {
        releases.items.map(release => {
          return <tr className='releases-table__body__row' key={release.id} id={release.id} >
            <td className='releases-table__body__row__created-date'>
              <span className="releases-table__body__row__created-date__on"><Human date={release.createdOn} /></span>
              <span className="releases-table__body__row__created-date__ago"><Ago date={release.createdOn} /></span>
            </td>
            <td className='releases-table__body__row__service-name'>{release.service.name}</td>
            <td className='releases-table__body__row__version'>{release.version}</td>
            <td className='releases-table__body__row__namespace-name'>{release.service.namespace.name}</td>
            <td className='releases-table__body__row__created-by'>
              <Link to={`/accounts/${release.createdBy.id}`}>{release.createdBy.displayName}</Link>
            </td>
          </tr>;
        })
      }
      </tbody>
    ;


    return (
      <div>
        <table className='releases-table table table-condensed table-hover'>
          <thead className='releases-table__heading'>
            <tr>
              <th className='releases-table__heading__created-date'>Created</th>
              <th className='releases-table__heading__service-name'>Service</th>
              <th className='releases-table__heading__version'>Version</th>
              <th className='releases-table__heading__namespace-name'>Namespace</th>
              <th className='releases-table__heading__created-by'>Created By</th>
            </tr>
          </thead>
          {
            (() => {
              if (error) return errorTableBody();
              else if (loading) return loadingTableBody();
              else if (!releases.count) return emptyTableBody();
              else return releasesTableBody();
            })()
          }
        </table>
        <TablePagination
          totalPages={releases.pages}
          currentPage={releases.currentPage}
          pageSize={releases.limit}
          fetchContent={fetchReleases}
        />
      </div>
    );
  }
}

ReleasesTable.propTypes = {
  error: PropTypes.object,
  loading: PropTypes.bool,
  releases: PropTypes.shape({
    limit: PropTypes.number.isRequired,
    offset: PropTypes.number.isRequired,
    pages: PropTypes.number.isRequired,
    currentPage: PropTypes.number.isRequired,
    count: PropTypes.number.isRequired,
    items: PropTypes.array.isRequired,
  }),
  fetchReleases: PropTypes.func,
};

export default ReleasesTable;

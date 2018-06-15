import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TablePagination from '../TablePagination';
import { Human, Ago } from '../DisplayDate';
import { AccountLink, RegistryLink, ServiceLink, ReleaseLink, CreateDeploymentLink } from '../Links';
import './ReleasesTable.css';

class ReleasesTable extends Component {

  render() {
    const { error = null, loading = false, releases = {}, fetchReleases } = this.props;

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
            <td className='releases-table__body__row__service-name'><ServiceLink service={release.service} /></td>
            <td className='releases-table__body__row__version'><ReleaseLink release={release} /></td>
            <td className='releases-table__body__row__registry-name'><RegistryLink registry={release.service.registry} /></td>
            <td className='releases-table__body__row__created-by'><AccountLink account={release.createdBy} /></td>
            <td>
              <CreateDeploymentLink
                service={release.service}
                registry={release.service.registry}
                version={release.version}
              />
            </td>
          </tr>;
        })
      }
      </tbody>
    ;


    return (
      <div>
        <table className='releases-table table table-sm table-responsive-lg table-hover'>
          <thead className='releases-table__heading'>
            <tr>
              <th className='releases-table__heading__created-date'>Created</th>
              <th className='releases-table__heading__service-name'>Service</th>
              <th className='releases-table__heading__version'>Version</th>
              <th className='releases-table__heading__registry-name'>Registry</th>
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
          pages={releases.pages}
          page={releases.page}
          limit={releases.limit}
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
    page: PropTypes.number.isRequired,
    count: PropTypes.number.isRequired,
    items: PropTypes.array.isRequired,
  }),
  fetchReleases: PropTypes.func,
};

export default ReleasesTable;

import React, { Component, } from 'react';
import PropTypes from 'prop-types';
import { Human, Ago, } from '../DisplayDate';
import './ReleasesTable.css';

class ReleasesTable extends Component {

  render() {
    const { error = null, loading = false, releases = [], } = this.props;

    const errorTableBody = (
      <tbody className='releases-table__body releases-table__body--error'>
        <tr className='releases-table__body__row'>
          <td className='releases-table__body__row__info' colSpan='3'>Error loading releases</td>
        </tr>
      </tbody>
    );

    const loadingTableBody = (
      <tbody className='releases-table__body releases-table__body--loading'>
        <tr className='releases-table__body__row'>
          <td className='releases-table__body__row__info' colSpan='3'>Loading releases…</td>
        </tr>
      </tbody>
    );

    const emptyTableBody = (
      <tbody className='releases-table__body releases-table__body--empty'>
        <tr className='releases-table__body__row'>
          <td className='releases-table__body__row__info' colSpan='3'>There are no releases</td>
        </tr>
      </tbody>
    );

    const releasesTableBody = (
      <tbody className='releases-table__body releases-table__body--data'>
      {
        releases.map(release => {
          return <tr className='releases-table__body__row' key={release.id} id={release.id} >
            <td className='releases-table__body__row__created'>
              <span className="releases-table__body__row__created__on"><Human date={release.createdOn} /></span>
              <span className="releases-table__body__row__created__ago"><Ago date={release.createdOn} /></span>
            </td>
            <td className='releases-table__body__row__namespace-name'>{release.service.namespace.name}</td>
            <td className='releases-table__body__row__service-name'>{release.service.name}</td>
            <td className='releases-table__body__row__version'>{release.version}</td>
          </tr>;
        })
      }
      </tbody>
    );


    return (
      <table className='releases-table table table-condensed table-hover'>
        <thead className='releases-table__heading'>
          <tr>
            <th className='releases-table__heading__created'>Created</th>
            <th className='releases-table__heading__namespace-name'>Namespace</th>
            <th className='releases-table__heading__service-name'>Service</th>
            <th className='releases-table__heading__version'>Version</th>
          </tr>
        </thead>
        {
          (() => {
            if (error) return errorTableBody;
            else if (loading) return loadingTableBody;
            else if (releases.length === 0) return emptyTableBody;
            else return releasesTableBody;
          })()
        }
      </table>
    );
  }
}

ReleasesTable.propTypes = {
  error: PropTypes.object,
  loading: PropTypes.bool,
  releases: PropTypes.array,
};

export default ReleasesTable;

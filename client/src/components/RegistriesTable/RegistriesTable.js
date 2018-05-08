import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TablePagination from '../TablePagination';
import { Human, Ago } from '../DisplayDate';
import { AccountLink, RegistryLink } from '../Links';
import './RegistriesTable.css';

class RegistriesTable extends Component {

  render() {
    const { error = null, loading = false, registries = {}, fetchRegistries } = this.props;

    const errorTableBody = () =>
      <tbody className='registries-table__body registries-table__body--error'>
        <tr className='registries-table__body__row'>
          <td className='registries-table__body__row__info' colSpan='3'>Error loading registries</td>
        </tr>
      </tbody>
    ;

    const loadingTableBody = () =>
      <tbody className='registries-table__body registries-table__body--loading'>
        <tr className='registries-table__body__row'>
          <td className='registries-table__body__row__info' colSpan='3'>Loading registries…</td>
        </tr>
      </tbody>
    ;

    const emptyTableBody = () =>
      <tbody className='registries-table__body registries-table__body--empty'>
        <tr className='registries-table__body__row'>
          <td className='registries-table__body__row__info' colSpan='3'>There are no registries</td>
        </tr>
      </tbody>
    ;

    const RegistriesTableBody = () =>
      <tbody className='registries-table__body registries-table__body--data'>
      {
        registries.items.map(registry => {
          return <tr className='registries-table__body__row' key={registry.id} id={registry.id} >
            <td className='registries-table__body__row__created-date'>
              <span className='registries-table__body__row__created-date__on'><Human date={registry.createdOn} /></span>
              <span className='registries-table__body__row__created-date__ago'><Ago date={registry.createdOn} /></span>
            </td>
            <td className='registries-table__body__row__registry-name'><RegistryLink registry={registry} /></td>
            <td className='registries-table__body__row__created-by'><AccountLink account={registry.createdBy} /></td>
          </tr>;
        })
      }
      </tbody>
    ;

    return (
      <div>
        <table className='registries-table table table-condensed table-hover'>
          <thead className='registries-table__heading'>
            <tr>
              <th className='registries-table__heading__created-date'>Created</th>
              <th className='registries-table__heading__registry-name'>Name</th>
              <th className='registries-table__heading__created-by'>Created By</th>
            </tr>
          </thead>
          {
            (() => {
              if (error) return errorTableBody();
              else if (loading) return loadingTableBody();
              else if (!registries.count) return emptyTableBody();
              else return RegistriesTableBody();
            })()
          }
        </table>
        <TablePagination
          totalPages={registries.pages}
          currentPage={registries.currentPage}
          pageSize={registries.limit}
          fetchContent={fetchRegistries}
        />
      </div>
    );
  }
}

RegistriesTable.propTypes = {
  error: PropTypes.object,
  loading: PropTypes.bool,
  registries: PropTypes.shape({
    limit: PropTypes.number.isRequired,
    offset: PropTypes.number.isRequired,
    pages: PropTypes.number.isRequired,
    currentPage: PropTypes.number.isRequired,
    count: PropTypes.number.isRequired,
    items: PropTypes.array.isRequired,
  }),
  fetchRegistries: PropTypes.func,
};

export default RegistriesTable;

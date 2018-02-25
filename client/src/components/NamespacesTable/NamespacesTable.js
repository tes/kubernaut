import React, { Component, } from 'react';
import PropTypes from 'prop-types';
import TablePagination from '../TablePagination';
import { Human, Ago, } from '../DisplayDate';
import { AccountLink, NamespaceLink, } from '../Links';
import './NamespacesTable.css';

class NamespacesTable extends Component {

  render() {
    const { error = null, loading = false, namespaces = {}, fetchNamespaces, } = this.props;

    const errorTableBody = () =>
      <tbody className='namespaces-table__body namespaces-table__body--error'>
        <tr className='namespaces-table__body__row'>
          <td className='namespaces-table__body__row__info' colSpan='4'>Error loading namespaces</td>
        </tr>
      </tbody>
    ;

    const loadingTableBody = () =>
      <tbody className='namespaces-table__body namespaces-table__body--loading'>
        <tr className='namespaces-table__body__row'>
          <td className='namespaces-table__body__row__info' colSpan='4'>Loading namespaces…</td>
        </tr>
      </tbody>
    ;

    const emptyTableBody = () =>
      <tbody className='namespaces-table__body namespaces-table__body--empty'>
        <tr className='namespaces-table__body__row'>
          <td className='namespaces-table__body__row__info' colSpan='4'>There are no namespaces</td>
        </tr>
      </tbody>
    ;

    const NamespacesTableBody = () =>
      <tbody className='namespaces-table__body namespaces-table__body--data'>
      {
        namespaces.items.map(namespace => {
          return <tr className='namespaces-table__body__row' key={namespace.id} id={namespace.id} >
            <td className='namespaces-table__body__row__created-date'>
              <span className='namespaces-table__body__row__created-date__on'><Human date={namespace.createdOn} /></span>
              <span className='namespaces-table__body__row__created-date__ago'><Ago date={namespace.createdOn} /></span>
            </td>
            <td className='namespaces-table__body__row__namespace-name'><NamespaceLink namespace={namespace} /></td>
            <td className='namespaces-table__body__row__context'>{namespace.context}</td>
            <td className='namespaces-table__body__row__created-by'><AccountLink account={namespace.createdBy} /></td>
          </tr>;
        })
      }
      </tbody>
    ;

    return (
      <div>
        <table className='namespaces-table table table-condensed table-hover'>
          <thead className='namespaces-table__heading'>
            <tr>
              <th className='namespaces-table__heading__created-date'>Created</th>
              <th className='namespaces-table__heading__namespace-name'>Name</th>
              <th className='namespaces-table__heading__context'>Context</th>
              <th className='namespaces-table__heading__created-by'>Created By</th>
            </tr>
          </thead>
          {
            (() => {
              if (error) return errorTableBody();
              else if (loading) return loadingTableBody();
              else if (!namespaces.count) return emptyTableBody();
              else return NamespacesTableBody();
            })()
          }
        </table>
        <TablePagination
          totalPages={namespaces.pages}
          currentPage={namespaces.currentPage}
          pageSize={namespaces.limit}
          fetchContent={fetchNamespaces}
        />
      </div>
    );
  }
}

NamespacesTable.propTypes = {
  error: PropTypes.object,
  loading: PropTypes.bool,
  namespaces: PropTypes.shape({
    limit: PropTypes.number.isRequired,
    offset: PropTypes.number.isRequired,
    pages: PropTypes.number.isRequired,
    currentPage: PropTypes.number.isRequired,
    count: PropTypes.number.isRequired,
    items: PropTypes.array.isRequired,
  }),
  fetchNamespaces: PropTypes.func,
};

export default NamespacesTable;

import React, { Component, } from 'react';
import PropTypes from 'prop-types';
import TablePagination from '../TablePagination';
import { Human, Ago, } from '../DisplayDate';
import './AccountsTable.css';

class AccountsTable extends Component {

  render() {
    const { error = null, loading = false, accounts = {}, fetchAccounts, } = this.props;

    const errorTableBody = () =>
      <tbody className='accounts-table__body accounts-table__body--error'>
        <tr className='accounts-table__body__row'>
          <td className='accounts-table__body__row__info' colSpan='4'>Error loading accounts</td>
        </tr>
      </tbody>
    ;

    const loadingTableBody = () =>
      <tbody className='accounts-table__body accounts-table__body--loading'>
        <tr className='accounts-table__body__row'>
          <td className='accounts-table__body__row__info' colSpan='4'>Loading accounts…</td>
        </tr>
      </tbody>
    ;

    const emptyTableBody = () =>
      <tbody className='accounts-table__body accounts-table__body--empty'>
        <tr className='accounts-table__body__row'>
          <td className='accounts-table__body__row__info' colSpan='4'>There are no accounts</td>
        </tr>
      </tbody>
    ;

    const AccountsTableBody = () =>
      <tbody className='accounts-table__body accounts-table__body--data'>
      {
        accounts.items.map(account => {
          return <tr className='accounts-table__body__row' key={account.id} id={account.id} >
            <td className='accounts-table__body__row__created'>
              <span className="accounts-table__body__row__created__on"><Human date={account.createdOn} /></span>
              <span className="accounts-table__body__row__created__ago"><Ago date={account.createdOn} /></span>
            </td>
            <td className='accounts-table__body__row__display-name'>{account.displayName}</td>
          </tr>;
        })
      }
      </tbody>
    ;

    return (
      <div>
        <table className='accounts-table table table-condensed table-hover'>
          <thead className='accounts-table__heading'>
            <tr>
              <th className='accounts-table__heading__created'>Created</th>
              <th className='accounts-table__heading__display-name'>Name</th>
            </tr>
          </thead>
          {
            (() => {
              if (error) return errorTableBody();
              else if (loading) return loadingTableBody();
              else if (!accounts.count) return emptyTableBody();
              else return AccountsTableBody();
            })()
          }
        </table>
        <TablePagination
          totalPages={accounts.pages}
          currentPage={accounts.currentPage}
          pageSize={accounts.limit}
          fetchContent={fetchAccounts}
        />
      </div>
    );
  }
}

AccountsTable.propTypes = {
  error: PropTypes.object,
  loading: PropTypes.bool,
  accounts: PropTypes.shape({
    limit: PropTypes.number.isRequired,
    offset: PropTypes.number.isRequired,
    pages: PropTypes.number.isRequired,
    currentPage: PropTypes.number.isRequired,
    count: PropTypes.number.isRequired,
    items: PropTypes.array.isRequired,
  }),
  fetchAccounts: PropTypes.func,
};

export default AccountsTable;

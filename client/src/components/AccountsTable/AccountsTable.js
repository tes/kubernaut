import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table } from 'reactstrap';
import TablePagination from '../TablePagination';
import { Human, Ago } from '../DisplayDate';
import { AccountLink } from '../Links';
import TableFilter from '../TableFilter';

class AccountsTable extends Component {

  render() {
    const {
      error = null,
      loading = false,
      accounts = {},
      fetchAccounts,
      toggleSort,
      sort,
      filterActions,
    } = this.props;

    const errorTableBody = () =>
      <tbody>
        <tr>
          <td colSpan='3'>Error loading accounts</td>
        </tr>
      </tbody>
    ;

    const loadingTableBody = () =>
      <tbody>
        <tr>
          <td colSpan='3'>Loading accounts…</td>
        </tr>
      </tbody>
    ;

    const emptyTableBody = () =>
      <tbody>
        <tr>
          <td colSpan='3'>There are no accounts</td>
        </tr>
      </tbody>
    ;

    const AccountsTableBody = () =>
      <tbody>
      {
        accounts.items.map(account => {
          return <tr key={account.id} id={account.id} >
            <td>
              <AccountLink account={account} />
            </td>
            <td>
              <span className="mr-4"><Human date={account.createdOn} /></span>
              <span className="font-italic"><Ago date={account.createdOn} /></span>
            </td>
            <td>
              <AccountLink account={account.createdBy} />
            </td>
          </tr>;
        })
      }
      </tbody>
    ;

    const arrowClass = sort.order === 'asc' ? 'arrow-up' : 'arrow-down';
    const arrowEl = <i className={`fa fa-${arrowClass}`} aria-hidden='true'></i>;
    const sortIcons = {
      name: sort.column === 'name' ? arrowEl : null,
      createdOn: sort.column === 'createdOn' ? arrowEl : null,
      createdBy: sort.column === 'createdBy' ? arrowEl : null,
    };

    return (
      <div>
        <TableFilter
          formPrefix="accounts"
          statePath="accounts.filter"
          columns={[
            { value: 'name', display: 'Name' },
            { value: 'createdBy', display: 'Created By' },
          ]}
          {...filterActions}
        />
        <Table hover size="sm">
          <thead>
            <tr>
              <th onClick={() => toggleSort('name')}>Name {sortIcons['name']}</th>
              <th onClick={() => toggleSort('createdOn')}>Created {sortIcons['createdOn']}</th>
              <th onClick={() => toggleSort('createdBy')}>Created By {sortIcons['createdBy']}</th>
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
        </Table>
        <TablePagination
          pages={accounts.pages}
          page={accounts.page}
          limit={accounts.limit}
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
    page: PropTypes.number.isRequired,
    count: PropTypes.number.isRequired,
    items: PropTypes.array.isRequired,
  }),
  fetchAccounts: PropTypes.func,
};

export default AccountsTable;

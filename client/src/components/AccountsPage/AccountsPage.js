import React, { Component } from 'react';
import PropTypes from 'prop-types';

import AccountsTable from '../AccountsTable';

class AccountsPage extends Component {

  render() {
    const {
      accounts,
      fetchAccountsPagination,
      toggleSort,
      sort,
      ...filterActions
    } = this.props;

    return (
      <div className='row'>
        <div className='col-12'>
          <AccountsTable
            accounts={accounts.data}
            loading={accounts.meta.loading}
            error={accounts.meta.error}
            fetchAccounts={fetchAccountsPagination}
            toggleSort={toggleSort}
            sort={sort}
            filterActions={filterActions}
          />
        </div>
      </div>
    );
  }
}

AccountsPage.propTypes = {
  accounts: PropTypes.object,
};

export default AccountsPage;

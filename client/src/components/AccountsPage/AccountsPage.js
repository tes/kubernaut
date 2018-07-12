import React, { Component } from 'react';
import PropTypes from 'prop-types';

import AccountsTable from '../AccountsTable';

class AccountsPage extends Component {

  componentDidMount() {
    this.props.fetchAccountsPagination();
  }

  render() {
    const { accounts, fetchAccountsPagination } = this.props;

    return (
      <div className='row'>
        <div className='col-12'>
          <AccountsTable accounts={accounts.data} loading={accounts.meta.loading} error={accounts.meta.error} fetchAccounts={fetchAccountsPagination} />
        </div>
      </div>
    );
  }
}

AccountsPage.propTypes = {
  accounts: PropTypes.object,
};

export default AccountsPage;

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import AccountsTable from '../AccountsTable';

class AccountsPage extends Component {

  componentDidMount() {
    this.props.fetchAccounts();
  }

  render() {
    const { accounts, fetchAccounts } = this.props;

    return (
      <div className='row'>
        <div className='col-12'>
          <AccountsTable accounts={accounts.data} loading={accounts.meta.loading} error={accounts.meta.error} fetchAccounts={fetchAccounts} />
        </div>
      </div>
    );
  }
}

AccountsPage.propTypes = {
  accounts: PropTypes.object,
};

export default AccountsPage;

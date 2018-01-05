import React, { Component, } from 'react';
import PropTypes from 'prop-types';

import AccountsTable from '../AccountsTable';

class AccountsPage extends Component {

  componentDidMount() {
    this.props.fetchAccounts();
  }

  render() {
    const { error, loading, accounts, fetchAccounts, } = this.props;

    return (
      <div className='row'>
        <div className='col-12'>
          <AccountsTable accounts={accounts.data} loading={loading} error={error} fetchAccounts={fetchAccounts} />
        </div>
      </div>
    );
  }
}

AccountsPage.propTypes = {
  accounts: PropTypes.object,
};

export default AccountsPage;

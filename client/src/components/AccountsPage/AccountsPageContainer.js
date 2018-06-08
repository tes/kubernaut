import { connect } from 'react-redux';
import { fetchAccounts } from '../../modules/accounts';

import AccountsPage from './AccountsPage';

function mapStateToProps(state, props) {
  return {
    accounts: {
      data: state.accounts.data,
      meta: state.accounts.meta,
    },
  };
}

const mapDispatchToProps = {
  fetchAccounts,
};

export default connect(mapStateToProps, mapDispatchToProps)(AccountsPage);

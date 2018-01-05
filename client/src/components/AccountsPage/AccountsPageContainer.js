import { connect, } from 'react-redux';
import { fetchAccounts, } from '../../actions/account';

import AccountsPage from './AccountsPage';

function mapStateToProps(state, props) {
  return {
    accounts: {
      data: state.accounts.data,
      meta: state.accounts.meta,
    },
  };
}

function mapDispatchToProps(dispatch) {
  return {
    fetchAccounts: (options) => {
      dispatch(fetchAccounts(options));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AccountsPage);

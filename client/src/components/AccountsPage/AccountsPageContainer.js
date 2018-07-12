import { connect } from 'react-redux';
import { fetchAccountsPagination } from '../../modules/accounts';

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
  fetchAccountsPagination,
};

export default connect(mapStateToProps, mapDispatchToProps)(AccountsPage);

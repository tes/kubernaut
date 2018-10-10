import { connect } from 'react-redux';
import {
  fetchAccountsPagination,
  toggleSort,
  addFilter,
  removeFilter,
  search,
  clearSearch,
  showFilters,
  hideFilters,
} from '../../modules/accounts';

import AccountsPage from './AccountsPage';

function mapStateToProps(state, props) {
  return {
    accounts: {
      data: state.accounts.data,
      meta: state.accounts.meta,
    },
    sort: state.accounts.sort,
  };
}

const mapDispatchToProps = {
  fetchAccountsPagination,
  toggleSort,
  addFilter,
  removeFilter,
  search,
  clearSearch,
  showFilters,
  hideFilters,
};

export default connect(mapStateToProps, mapDispatchToProps)(AccountsPage);

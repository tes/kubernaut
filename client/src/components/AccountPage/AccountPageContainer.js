import { connect } from 'react-redux';
import AccountPage from './AccountPage';

import { fetchAccountInfo } from '../../modules/viewAccount';

export default connect((state, props) => ({
  accountId: props.accountId,
  account: state.viewAccount.account,
  namespaces: state.viewAccount.namespaces,
  registries: state.viewAccount.registries,
  meta: state.viewAccount.meta,
}), {
  fetchAccountInfo,
})(AccountPage);

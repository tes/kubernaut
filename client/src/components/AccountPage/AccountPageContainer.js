import { connect } from 'react-redux';
import AccountPage from './AccountPage';

import Account from '../../lib/domain/Account';
import { fetchAccountInfo } from '../../modules/viewAccount';

export default connect((state, props) => ({
  canEdit: new Account(state.account.data).hasPermission('accounts-write'),
  accountId: props.accountId,
  account: state.viewAccount.account,
  namespaces: state.viewAccount.namespaces,
  registries: state.viewAccount.registries,
  meta: state.viewAccount.meta,
}), {
  fetchAccountInfo,
})(AccountPage);

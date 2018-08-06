import { connect } from 'react-redux';
import AccountEditPage from './AccountEditPage';

import Account from '../../lib/domain/Account';
import { fetchAccountInfo } from '../../modules/editAccount';

export default connect((state, props) => ({
  canEdit: new Account(state.account.data).hasPermission('accounts-write'),
  accountId: props.accountId,
  account: state.editAccount.account,
  namespaces: state.editAccount.namespaces,
  registries: state.editAccount.registries,
  meta: state.editAccount.meta,
}), {
  fetchAccountInfo,
})(AccountEditPage);

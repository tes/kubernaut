import { connect } from 'react-redux';
import AccountEditPage from './AccountEditPage';

export default connect((state, props) => ({
  canEdit: state.editAccount.canEdit,
  accountId: props.accountId,
  account: state.editAccount.account,
  namespaces: state.editAccount.namespaces,
  registries: state.editAccount.registries,
  meta: state.editAccount.meta,
}))(AccountEditPage);

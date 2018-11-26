import { connect } from 'react-redux';
import AccountPage from './AccountPage';

export default connect((state, props) => ({
  canEdit: state.viewAccount.canEdit,
  accountId: props.accountId,
  account: state.viewAccount.account,
  namespaces: state.viewAccount.namespaces,
  registries: state.viewAccount.registries,
  meta: state.viewAccount.meta,
}))(AccountPage);

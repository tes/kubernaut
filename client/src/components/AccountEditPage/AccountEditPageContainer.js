import { connect } from 'react-redux';
import AccountEditPage from './AccountEditPage';

export default connect((state, props) => ({
  canEdit: state.editAccount.canEdit,
  canManageTeam: state.editAccount.canManageTeam,
  accountId: props.accountId,
  account: state.editAccount.account,
  meta: state.editAccount.meta,
}))(AccountEditPage);

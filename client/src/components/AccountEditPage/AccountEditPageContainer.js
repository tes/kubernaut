import { connect } from 'react-redux';
import {
  openDeleteModal,
  closeDeleteModal,
  deleteAccount,
} from '../../modules/editAccount';
import AccountEditPage from './AccountEditPage';

export default connect((state, props) => ({
  canEdit: state.editAccount.canEdit,
  canDelete: state.editAccount.canDelete,
  canManageTeam: state.editAccount.canManageTeam,
  accountId: props.accountId,
  account: state.editAccount.account,
  meta: state.editAccount.meta,
  deleteModalOpen: state.editAccount.deleteModalOpen,
}), {
  openDeleteModal,
  closeDeleteModal,
  deleteAccount,
})(AccountEditPage);

import { connect } from 'react-redux';
import {
  generateBearer,
  closeBearerModal,
  auditAccount,
} from '../../modules/viewAccount';
import AccountPage from './AccountPage';

export default connect((state, props) => ({
  canEdit: state.viewAccount.canEdit,
  canManageTeam: state.viewAccount.canManageTeam,
  accountId: props.accountId,
  account: state.viewAccount.account,
  namespaces: state.viewAccount.namespaces,
  registries: state.viewAccount.registries,
  meta: state.viewAccount.meta,
  canGenerate: state.viewAccount.canGenerate,
  bearerToken: state.viewAccount.bearerToken,
  generateModalOpen: state.viewAccount.generateModalOpen,
  canAudit: state.account.permissions['audit-read'],
}), {
  generateBearer,
  closeBearerModal,
  auditAccount,
})(AccountPage);

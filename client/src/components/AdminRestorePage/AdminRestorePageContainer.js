import { connect } from 'react-redux';
import {
  reduxForm,
} from 'redux-form';
import {
  changeType,
  restore,
  fetchDeletedPagination,
} from '../../modules/adminRestore';
import AdminRestorePage from './AdminRestorePage';

const formName = 'adminRestore';

export default connect(({ account, adminRestore }) => ({
  canAudit: account && account.permissions && account.permissions['audit-read'],
  hasClustersWrite: account && account.permissions && account.permissions['clusters-write'],
  hasIngressAdminWrite: account && account.permissions && account.permissions['ingress-admin'],
  deleted: adminRestore.deleted,
}), {
  changeType,
  restore,
  fetchDeletedPagination,
})(reduxForm({
  form: formName,
  enableReinitialize: true,
  destroyOnUnmount: false,
})(AdminRestorePage));

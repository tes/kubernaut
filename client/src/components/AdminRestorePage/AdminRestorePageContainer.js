import { connect } from 'react-redux';
import {
  reduxForm,
} from 'redux-form';
import {
  changeType,
  restore,
} from '../../modules/adminRestore';
import AdminRestorePage from './AdminRestorePage';

const formName = 'adminRestore';

export default connect(({ account, adminRestore }) => ({
  canAudit: account && account.permissions && account.permissions['audit-read'],
  deleted: adminRestore.deleted,
}), {
  changeType,
  restore,
})(reduxForm({
  form: formName,
  enableReinitialize: true,
  destroyOnUnmount: false,
})(AdminRestorePage));

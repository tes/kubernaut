import { connect } from 'react-redux';
import { reduxForm, getFormValues } from 'redux-form';
import AccountSystemRolesForm from './AccountSystemRolesForm';
import {
  updateSystemRole,
  updateGlobalRole,
} from '../../modules/editAccount';

const formName = 'accountSystemRoles';

export default connect((state, props) => {
  const formCurrentValues = getFormValues(formName)(state) || {};

  return {
    initialValues: state.editAccount.systemRoles.initialValues,
    rolesGrantable: state.editAccount.systemRoles.rolesGrantable,
    globalGrantable: state.editAccount.systemRoles.globalGrantable,
    currentValues: formCurrentValues,
    disableGlobals: props.account.id === state.account.data.id,
  };
}, {
  updateSystemRole,
  updateGlobalRole,
})(reduxForm({
  form: formName,
  enableReinitialize: true,
  destroyOnUnmount: false,
})(AccountSystemRolesForm));

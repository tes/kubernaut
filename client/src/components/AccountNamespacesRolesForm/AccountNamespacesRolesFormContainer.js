import { connect } from 'react-redux';
import { reduxForm, getFormValues } from 'redux-form';
import AccountNamespacesRolesForm from './AccountNamespacesRolesForm';
import {
  updateRolesForNamespace,
  addNewNamespace,
  deleteRolesForNamespace,
} from '../../modules/editAccount';

const formName = 'accountNamespacesRoles';

export default connect((state) => {
  const formCurrentValues = getFormValues(formName)(state) || {};

  return {
    initialValues: state.editAccount.namespacesRoles.initialValues,
    currentValues: formCurrentValues,
    currentRoles: state.editAccount.namespacesRoles.currentRoles,
    namespacesPossibleToAdd: state.editAccount.namespacesRoles.availableNamespaces,
    rolesGrantable: state.editAccount.namespacesRoles.rolesGrantable,
  };
}, {
  updateRolesForNamespace,
  addNewNamespace,
  deleteRolesForNamespace,
})(reduxForm({
  form: formName,
  enableReinitialize: true,
  destroyOnUnmount: false,
})(AccountNamespacesRolesForm));

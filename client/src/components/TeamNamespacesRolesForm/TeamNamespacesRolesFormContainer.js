import { connect } from 'react-redux';
import { reduxForm, getFormValues } from 'redux-form';
import NamespacesRolesForm from '../NamespacesRolesForm';
import {
  updateRolesForNamespace,
  addNewNamespace,
  deleteRolesForNamespace,
} from '../../modules/editTeam';

const formName = 'teamNamespacesRoles';

export default connect((state) => {
  const formCurrentValues = getFormValues(formName)(state) || {};

  return {
    initialValues: state.editTeam.namespacesRoles.initialValues,
    currentValues: formCurrentValues,
    currentRoles: state.editTeam.namespacesRoles.currentRoles,
    namespacesPossibleToAdd: state.editTeam.namespacesRoles.availableNamespaces,
    suggestedNamespaces: state.editTeam.namespacesRoles.suggestedNamespaces,
    rolesGrantable: state.editTeam.namespacesRoles.rolesGrantable,
  };
}, {
  updateRolesForNamespace,
  addNewNamespace,
  deleteRolesForNamespace,
})(reduxForm({
  form: formName,
  enableReinitialize: true,
  destroyOnUnmount: false,
})(NamespacesRolesForm));

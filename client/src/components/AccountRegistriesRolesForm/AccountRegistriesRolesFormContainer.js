import { connect } from 'react-redux';
import { reduxForm, getFormValues } from 'redux-form';
import AccountRegistriesRolesForm from './AccountRegistriesRolesForm';
import {
  updateRolesForRegistry,
  addNewRegistry,
  deleteRolesForRegistry,
} from '../../modules/editAccount';

const formName = 'accountRegistriesRoles';

export default connect((state) => {
  const formCurrentValues = getFormValues(formName)(state) || {};

  return {
    initialValues: state.editAccount.registriesRoles.initialValues,
    currentValues: formCurrentValues,
    currentRoles: state.editAccount.registriesRoles.currentRoles,
    registriesPossibleToAdd: state.editAccount.registriesRoles.availableRegistries,
    rolesGrantable: state.editAccount.registriesRoles.rolesGrantable,
  };
},{
  updateRolesForRegistry,
  addNewRegistry,
  deleteRolesForRegistry,
})(reduxForm({
  form: formName,
  enableReinitialize: true,
  destroyOnUnmount: false,
})(AccountRegistriesRolesForm));

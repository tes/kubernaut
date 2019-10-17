import { connect } from 'react-redux';
import { reduxForm, getFormValues } from 'redux-form';
import RegistriesRolesForm from '../RegistriesRolesForm';
import {
  updateRolesForRegistry,
  addNewRegistry,
  deleteRolesForRegistry,
} from '../../modules/editTeam';

const formName = 'teamRegistriesRoles';

export default connect((state) => {
  const formCurrentValues = getFormValues(formName)(state) || {};

  return {
    initialValues: state.editTeam.registriesRoles.initialValues,
    currentValues: formCurrentValues,
    currentRoles: state.editTeam.registriesRoles.currentRoles,
    registriesPossibleToAdd: state.editTeam.registriesRoles.availableRegistries,
    rolesGrantable: state.editTeam.registriesRoles.rolesGrantable,
  };
},{
  updateRolesForRegistry,
  addNewRegistry,
  deleteRolesForRegistry,
})(reduxForm({
  form: formName,
  enableReinitialize: true,
  destroyOnUnmount: false,
})(RegistriesRolesForm));

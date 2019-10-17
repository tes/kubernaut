import { connect } from 'react-redux';
import { reduxForm, getFormValues } from 'redux-form';
import TeamsRolesForm from '../TeamsRolesForm';
import {
  updateRolesForTeam,
  addNewTeam,
  deleteRolesForTeam,
} from '../../modules/editAccount';

const formName = 'accountTeamsRoles';

export default connect((state) => {
  const formCurrentValues = getFormValues(formName)(state) || {};

  return {
    initialValues: state.editAccount.teamsRoles.initialValues,
    currentValues: formCurrentValues,
    currentRoles: state.editAccount.teamsRoles.currentRoles,
    teamsPossibleToAdd: state.editAccount.teamsRoles.availableTeams,
    rolesGrantable: state.editAccount.teamsRoles.rolesGrantable,
  };
}, {
  updateRolesForTeam,
  addNewTeam,
  deleteRolesForTeam,
})(reduxForm({
  form: formName,
  enableReinitialize: true,
  destroyOnUnmount: false,
})(TeamsRolesForm));

import { connect } from 'react-redux';
import { reduxForm, getFormValues } from 'redux-form';
import TeamsRolesForm from '../TeamsRolesForm';
import {
  updateRolesForTeam,
  addNewTeam,
  deleteRolesForTeam,
} from '../../modules/editTeam';

const formName = 'teamTeamsRoles';

export default connect((state) => {
  const formCurrentValues = getFormValues(formName)(state) || {};

  return {
    initialValues: state.editTeam.teamsRoles.initialValues,
    currentValues: formCurrentValues,
    currentRoles: state.editTeam.teamsRoles.currentRoles,
    teamsPossibleToAdd: state.editTeam.teamsRoles.availableTeams,
    rolesGrantable: state.editTeam.teamsRoles.rolesGrantable,
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

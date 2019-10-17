import { connect } from 'react-redux';
import { reduxForm, getFormValues } from 'redux-form';
import SystemRolesForm from '../SystemRolesForm';
import {
  updateSystemRole,
  updateGlobalRole,
} from '../../modules/editTeam';

const formName = 'teamSystemRoles';

export default connect((state, props) => {
  const formCurrentValues = getFormValues(formName)(state) || {};

  return {
    initialValues: state.editTeam.systemRoles.initialValues,
    rolesGrantable: state.editTeam.systemRoles.rolesGrantable,
    globalGrantable: state.editTeam.systemRoles.globalGrantable,
    currentValues: formCurrentValues,
  };
}, {
  updateSystemRole,
  updateGlobalRole,
})(reduxForm({
  form: formName,
  enableReinitialize: true,
  destroyOnUnmount: false,
})(SystemRolesForm));

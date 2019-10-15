import { connect } from 'react-redux';
import { reduxForm, getFormValues } from 'redux-form';
import { addMembership, removeMembership } from '../../modules/editAccountTeams';

import AccountTeamPage from './AccountTeamPage';

const formName = 'accountTeamMembership';

export default connect((state, props) => {
  const { editAccountTeams } = state;
  const formCurrentValues = getFormValues(formName)(state) || {};

  return {
    canEdit: editAccountTeams.canEdit,
    canManageTeam: editAccountTeams.canManageTeam,
    accountId: props.accountId,
    account: editAccountTeams.account,
    meta: editAccountTeams.meta,
    initialValues: editAccountTeams.teamMembership.initialValues,
    teamMembership: editAccountTeams.teamMembership,
    currentValues: formCurrentValues,
  };
}, {
  addMembership,
  removeMembership,
})(reduxForm({
  form: formName,
  enableReinitialize: true,
  destroyOnUnmount: false,
})(AccountTeamPage));

import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';

import { submitForm } from '../../modules/teamAttrs';
import TeamAttrsPage from './TeamAttrsPage';

export default connect(({ teamAttrs }) => ({
  canEdit: teamAttrs.canEdit,
  meta: teamAttrs.meta,
  team: teamAttrs.team,
  initialValues: teamAttrs.initialValues,
  submitForm,
}))(reduxForm({
  form: 'teamAttrs',
  enableReinitialize: true,
  destroyOnUnmount: false,
})(TeamAttrsPage));

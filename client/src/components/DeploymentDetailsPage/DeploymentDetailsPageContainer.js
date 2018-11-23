import { connect } from 'react-redux';
import {
  submitNoteForm,
  openModal,
  closeModal,
} from '../../modules/deployment';
import { reduxForm } from 'redux-form';

import DeploymentDetailsPage from './DeploymentDetailsPage';

function mapStateToProps(state) {
  const deployment = state.deployment.data;
  return {
    deployment,
    meta: state.deployment.meta,
    canEdit: state.deployment.canEdit,
    submitNoteForm,
    modalOpen: state.deployment.modalOpen,
    initialValues: {
      note: state.deployment.data && state.deployment.data.note,
    },
  };
}

export default connect(mapStateToProps, {
  openModal,
  closeModal,
})(reduxForm({
  form: 'deploymentNote',
  enableReinitialize: true,
  destroyOnUnmount: false,
})(DeploymentDetailsPage));

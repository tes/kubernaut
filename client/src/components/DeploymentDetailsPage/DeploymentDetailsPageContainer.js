import { connect } from 'react-redux';
import {
  submitNoteForm,
  openModal,
  closeModal,
  toggleManifestOpen,
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
    manifestOpen: state.deployment.manifestOpen,
  };
}

export default connect(mapStateToProps, {
  openModal,
  closeModal,
  toggleManifestOpen,
})(reduxForm({
  form: 'deploymentNote',
  enableReinitialize: true,
  destroyOnUnmount: false,
})(DeploymentDetailsPage));

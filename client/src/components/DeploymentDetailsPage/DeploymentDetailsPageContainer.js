import { connect } from 'react-redux';
import {
  submitNoteForm,
  openModal,
  closeModal,
} from '../../modules/deployment';
import Account from '../../lib/domain/Account';
import { reduxForm } from 'redux-form';

import DeploymentDetailsPage from './DeploymentDetailsPage';

function mapStateToProps(state) {
  const deployment = state.deployment.data;
  return {
    deployment,
    meta: state.deployment.meta,
    canEdit: deployment && new Account(state.account.data).hasPermissionOnNamespace(deployment.namespace.id, 'namespaces-write'),
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

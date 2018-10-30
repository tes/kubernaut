import { connect } from 'react-redux';
import {
  fetchDeployment,
  submitNoteForm,
  openModal,
  closeModal,
} from '../../modules/deployment';
import Account from '../../lib/domain/Account';
import { reduxForm } from 'redux-form';

import DeploymentDetailsPage from './DeploymentDetailsPage';

function mapStateToProps(state, props) {
  const deployment = state.deployment.data;
  return {
    deploymentId: props.deploymentId,
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
  fetchDeployment,
  openModal,
  closeModal,
})(reduxForm({
  form: 'deploymentNote',
  enableReinitialize: true,
  destroyOnUnmount: false,
})(DeploymentDetailsPage));

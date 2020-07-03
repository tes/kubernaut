import { connect } from 'react-redux';
import {
  reduxForm,
  getFormValues,
  getFormSyncErrors,
  // getFormAsyncErrors,
} from 'redux-form';
import {
  submitForm,
  validateCustomHost,
} from '../../modules/newIngressVersion';
import NewIngressVersionPage from './NewIngressVersionPage';

const formName = 'newIngressVersion';

export default connect((state, props) => {
  const currentFormValues = getFormValues(formName)(state) || {};
  const currentFormSyncErrors = getFormSyncErrors(formName)(state) || {};
  const hasErrors = Object.keys(currentFormSyncErrors).length > 0;

  const canSave = !hasErrors && currentFormValues && currentFormValues.comment;

  return {
    initialValues: state.newIngressVersion.initialValues,
    ingressClasses: state.newIngressVersion.ingressClasses,
    ingressHostKeys: state.newIngressVersion.ingressHostKeys,
    ingressVariables: state.newIngressVersion.ingressVariables,
    service: state.newIngressVersion.service,
    meta: state.newIngressVersion.meta,
    initialEntryValues: state.newIngressVersion.initialEntryValues,
    canManage: state.newIngressVersion.canManage,
    canWriteIngress: state.newIngressVersion.canWriteIngress,
    team: state.newIngressVersion.team,
    submitForm,
    currentFormValues,
    currentFormSyncErrors,
    canSave,
  };
}, {
  validateCustomHost,
})(reduxForm({
  form: formName,
  enableReinitialize: true,
  destroyOnUnmount: false,
})(NewIngressVersionPage));

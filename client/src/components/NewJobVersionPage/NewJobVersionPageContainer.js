import { connect } from 'react-redux';
import {
  reduxForm,
  getFormValues,
  getFormSyncErrors,
  getFormAsyncErrors,
} from 'redux-form';

import {
  toggleCollapsed,
  triggerPreview,
  submitForm,
  addSecret,
  saveVersion,
  removeSecret,
  validateAnnotations,
} from '../../modules/newJobVersion';
import NewJobVersionPage from './NewJobVersionPage';

const formName = 'newJobVersion';

const mapStateToProps = (state, props) => {
  const { newJobVersion } = state;
  const currentFormValues = getFormValues(formName)(state) || {};
  const currentFormSyncErrors = getFormSyncErrors(formName)(state) || {};

  const asyncErrors = getFormAsyncErrors(formName)(state) || {};
  const secretErrors = (asyncErrors.secret && asyncErrors.secret.secrets) || [];

  return {
    initialValues: newJobVersion.initialValues,
    currentFormValues,
    currentFormSyncErrors,
    collapsed: newJobVersion.collapsed,
    meta: newJobVersion.meta,
    job: newJobVersion.job.data,
    preview: newJobVersion.preview,
    submitForm,

    formSecrets: (currentFormValues && currentFormValues.secret && currentFormValues.secret.secrets) || [],
    secretErrors,
  };
};

export default connect(mapStateToProps, {
  toggleCollapsed,
  triggerPreview,
  addSecret,
  saveVersion,
  removeSecret,
  validateAnnotations,
})(reduxForm({
  form: formName,
  enableReinitialize: true,
  destroyOnUnmount: false,
})(NewJobVersionPage));

import { connect } from 'react-redux';
import {
  reduxForm,
  getFormValues,
  getFormSyncErrors,
  getFormAsyncErrors,
} from 'redux-form';
import { isValidCron } from 'cron-validator';

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

const validName = /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9])$/;

const validate = (values, props) => {
  const errors = {};

  if (!values.schedule) errors.schedule = 'Invalid cron syntax';
  else if (!isValidCron(values.schedule, { alias: true })) errors.schedule = 'Invalid cron syntax';

  errors.initContainers = (values.containers || []).map(c => ({
    name: (c.name || '').match(validName) ? null : 'Invalid name',
    image: c.image ? null : 'Cannot be empty',
    command: (c.command || []).map(cm => cm ? null : 'Cannot be empty'),
    volumeMounts: (c.volumeMounts || []).map(vm => ({
      mountPath: vm.mountPath ? null : 'Cannot be empty',
      name: vm.name ? null : 'Cannot be empty',
    })),
  }));
  errors.containers = (values.containers || []).map(c => ({
    name: (c.name || '').match(validName) ? null : 'Invalid name',
    image: c.image ? null : 'Cannot be empty',
    command: (c.command || []).map(cm => cm ? null : 'Cannot be empty'),
    volumeMounts: (c.volumeMounts || []).map(vm => ({
      mountPath: vm.mountPath ? null : 'Cannot be empty',
      name: vm.name ? null : 'Cannot be empty',
    })),
  }));

  errors.volumes = (values.volumes || []).map(v => ({
    name: (v.name || '').match(validName) ? null : 'Invalid name',
    configMap: v.type === 'configMap' ? {
      name: ((v.configMap || {}).name || '').match(validName) ? null : 'Invalid name',
    } : null,
  }));

  return errors;
};

const mapStateToProps = (state, props) => {
  const { newJobVersion } = state;
  const currentFormValues = getFormValues(formName)(state) || {};
  const currentFormSyncErrors = getFormSyncErrors(formName)(state) || {};

  const asyncErrors = getFormAsyncErrors(formName)(state) || {};
  const secretErrors = (asyncErrors.secret && asyncErrors.secret.secrets) || [];

  return {
    initialValues: newJobVersion.initialValues,
    initialContainerValues: newJobVersion.initialContainerValues,
    currentFormValues,
    currentFormSyncErrors,
    collapsed: newJobVersion.collapsed,
    meta: newJobVersion.meta,
    job: newJobVersion.job.data,
    preview: newJobVersion.preview,
    submitForm,
    canEdit: newJobVersion.canEdit,
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
  validate,
})(NewJobVersionPage));

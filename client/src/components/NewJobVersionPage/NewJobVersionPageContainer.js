import { connect } from 'react-redux';
import {
  reduxForm,
  getFormValues,
  getFormSyncErrors,
} from 'redux-form';

import {
  toggleCollapsed,
  triggerPreview,
  submitForm,
} from '../../modules/newJobVersion';
import NewJobVersionPage from './NewJobVersionPage';

const formName = 'newJobVersion';

const mapStateToProps = (state, props) => {
  const { newJobVersion } = state;
  const currentFormValues = getFormValues(formName)(state) || {};
  const currentFormSyncErrors = getFormSyncErrors(formName)(state) || {};

  return {
    initialValues: newJobVersion.initialValues,
    currentFormValues,
    currentFormSyncErrors,
    collapsed: newJobVersion.collapsed,
    meta: newJobVersion.meta,
    job: newJobVersion.job.data,
    preview: newJobVersion.preview,
    submitForm,
  };
};

export default connect(mapStateToProps, {
  toggleCollapsed,
  triggerPreview,
})(reduxForm({
  form: formName,
  enableReinitialize: true,
  destroyOnUnmount: false,
})(NewJobVersionPage));

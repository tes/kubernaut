import { connect } from 'react-redux';
import { reduxForm, getFormValues, getFormAsyncErrors } from 'redux-form';
import { addSecret, saveVersion, removeSecret, validateAnnotations } from '../../modules/newSecretVersion';
import NewSecretVersionPage from './NewSecretVersionPage';

export default connect((state, props) => {
  const { newSecretVersion } = state;
  const { registryName, serviceName } = props;
  const formValues = getFormValues('newSecretVersion')(state);
  const asyncErrors = getFormAsyncErrors('newSecretVersion')(state) || {};
  const secretErrors = asyncErrors.secrets || [];
  const doSecretsHaveErrors = secretErrors.filter(s => s && s.value).length > 0;

  const canAddNewSecret = formValues
    && formValues.newSecretSection
    && formValues.newSecretSection.newSecretName
    && formValues.newSecretSection.newSecretType
    && (!(formValues.secrets || []).find(s => s.key === formValues.newSecretSection.newSecretName));

  const canSave = !doSecretsHaveErrors && formValues && formValues.comment;

  return {
    canManage: newSecretVersion.canManage,
    meta: newSecretVersion.meta,
    registryName,
    serviceName,
    version: newSecretVersion.version,
    namespace: newSecretVersion.namespace,
    initialValues: newSecretVersion.initialValues,
    canAddNewSecret,
    canSave,
    saveVersion,
    formSecrets: (formValues && formValues.secrets) || [],
    secretErrors,
  };
},{
  addSecret,
  removeSecret,
  validateAnnotations,
})(reduxForm({
  form: 'newSecretVersion',
  enableReinitialize: true,
  destroyOnUnmount: false,
})(NewSecretVersionPage));

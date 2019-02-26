import { connect } from 'react-redux';
import { reduxForm, getFormValues } from 'redux-form';
import { addSecret, saveVersion } from '../../modules/newSecretVersion';
import NewSecretVersionPage from './NewSecretVersionPage';

export default connect((state, props) => {
  const { newSecretVersion } = state;
  const { registryName, serviceName } = props;
  const formValues = getFormValues('newSecretVersion')(state);

  const canAddNewSecret = formValues && formValues.newSecretSection && formValues.newSecretSection.newSecretName && formValues.newSecretSection.newSecretType;
  const canSave = formValues && formValues.comment;

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
  };
},{
  addSecret,
})(reduxForm({
  form: 'newSecretVersion',
  enableReinitialize: true,
  destroyOnUnmount: false,
})(NewSecretVersionPage));

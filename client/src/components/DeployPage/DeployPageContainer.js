import { connect } from 'react-redux';
import {
  reduxForm,
  getFormValues,
  getFormAsyncErrors,
} from 'redux-form';

import {
  submitForm,
  fetchServiceSuggestions,
  useServiceSuggestion,
  clearFormFields,
  validateService,
  validateVersion,
  fetchSecretVersions,
  fetchIngressVersions,
} from '../../modules/deploy';
import DeployPage from './DeployPage';

const formName = 'deploy';

const mapStateToProps = (state, props) => {
  const { deploy } = state;
  const currentFormValues = getFormValues(formName)(state) || {};
  const currentFormAsyncErrors = getFormAsyncErrors(formName)(state) || {};

  return {
    initialValues: deploy.initialValues,
    canManage: deploy.canManage,
    serviceName: deploy.serviceName,
    registryName: deploy.registryName,
    version: deploy.version,
    team: deploy.team,
    registries: deploy.registries,
    namespacesRich: deploy.namespaces,
    meta: deploy.meta,
    registrySelected: !!currentFormValues.registry,
    serviceSelected: (!!currentFormValues.service && !currentFormAsyncErrors.service),
    versionSelected: (!!currentFormValues.version && !currentFormAsyncErrors.version),
    namespaceSelected: !!currentFormValues.namespace,
    submitForm,
    serviceSuggestions: deploy.serviceSuggestions,
    deployments: deploy.deployments,
    currentFormValues,
    secretVersions: deploy.secretVersions,
    ingressVersions: deploy.ingressVersions,
  };
};

export default connect(mapStateToProps, {
  fetchServiceSuggestions,
  useServiceSuggestion,
  clearFormFields,
  validateService,
  validateVersion,
  fetchSecretVersions,
  fetchIngressVersions,
})(reduxForm({
  form: formName,
  enableReinitialize: true,
  destroyOnUnmount: false,
})(DeployPage));

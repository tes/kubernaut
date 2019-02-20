import { connect } from 'react-redux';
import {
  reduxForm,
  getFormValues,
  getFormAsyncErrors,
} from 'redux-form';
import _uniq from 'lodash/uniq';

import {
  submitForm,
  fetchServiceSuggestions,
  useServiceSuggestion,
  clearFormFields,
  validateService,
  validateVersion,
  fetchSecretVersions,
} from '../../modules/deploy';
import DeployPage from './DeployPage';

const formName = 'deploy';

const mapStateToProps = (state, props) => {
  const {
    registry,
    service,
    version,
    cluster,
    namespace,
  } = props.parsedLocation;
  const { deploy } = state;
  const currentFormValues = getFormValues(formName)(state) || {};
  const currentFormAsyncErrors = getFormAsyncErrors(formName)(state) || {};

  return {
    initialValues: {
      registry,
      service,
      version,
      cluster,
      namespace,
    },
    registries: deploy.registries,
    clusters: _uniq(deploy.namespaces.map(({ cluster }) => (cluster.name))),
    namespaces: deploy.namespaces.filter((namespace) => (namespace.cluster.name === currentFormValues.cluster)).map(({ name }) => (name)),
    namespacesRich: deploy.namespaces.filter((namespace) => (namespace.cluster.name === currentFormValues.cluster)),
    meta: deploy.meta,
    registrySelected: !!currentFormValues.registry,
    serviceSelected: (!!currentFormValues.service && !currentFormAsyncErrors.service),
    clusterSelected: !!currentFormValues.cluster,
    namespaceSelected: !!currentFormValues.namespace,
    submitForm,
    serviceSuggestions: deploy.serviceSuggestions,
    deployments: deploy.deployments,
    currentFormValues,
    secretVersions: deploy.secretVersions,
  };
};

export default connect(mapStateToProps, {
  fetchServiceSuggestions,
  useServiceSuggestion,
  clearFormFields,
  validateService,
  validateVersion,
  fetchSecretVersions,
})(reduxForm({
  form: formName,
  enableReinitialize: true,
  destroyOnUnmount: false,
})(DeployPage));

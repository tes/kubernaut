import { connect } from 'react-redux';
import {
  reduxForm,
  getFormValues,
  getFormAsyncErrors,
} from 'redux-form';
import _uniq from 'lodash/uniq';

import {
  triggerDeployment,
  fetchRegistries,
  fetchNamespaces,
  asyncValidateForm,
  initialise,
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
    meta: deploy.meta,
    registrySelected: !!currentFormValues.registry,
    serviceSelected: (!!currentFormValues.service && !currentFormAsyncErrors.service),
    clusterSelected: !!currentFormValues.cluster,
  };
};

export default connect(mapStateToProps, {
  triggerDeployment,
  fetchRegistries,
  fetchNamespaces,
  initialise,
})(reduxForm({
  form: formName,
  enableReinitialize: true,
  destroyOnUnmount: false,
  asyncValidate: asyncValidateForm,
  asyncChangeFields: ['service', 'version'],
})(DeployPage));

import { takeEvery, takeLatest, take, call, put, select, all } from 'redux-saga/effects';
import {
  SubmissionError,
  change,
  stopAsyncValidation,
  startAsyncValidation,
} from 'redux-form';
import { push } from 'connected-react-router';
import { parseQueryString } from './lib/query';
import {
  submitForm,
  fetchServiceSuggestions,
  setServiceSuggestions,
  useServiceSuggestion,
  clearServiceSuggestions,
  getDeployFormValues,
  clearFormFields,
  validateService,
  validateVersion,
  fetchNamespacesForService,
  fetchLatestDeploymentsPerNamespace,
  fetchSecretVersions,
  INITIALISE,
  INITIALISE_ERROR,
  SET_LOADING,
  CLEAR_LOADING,
  SET_REGISTRIES,
  SET_NAMESPACES,
  SET_DEPLOYMENTS,
  SET_INITIAL_FORM_VALUES,
  setSecretVersions,
  selectNamespaces,
} from '../modules/deploy';

import {
  makeDeployment,
  getRegistries,
  getNamespacesForService,
  getServiceSuggestions,
  getReleases,
  getLatestDeploymentsByNamespaceForService,
  getSecretVersions,
  getLatestDeployedSecretVersion,
} from '../lib/api';

export function* fetchRegistriesSaga({ payload = {} }) {
  yield put(SET_LOADING());
  try {
    const data = yield call(getRegistries);
    if (data.count) yield put(SET_REGISTRIES({ data: data.items.map(({ name }) => (name)) }));
    yield put(CLEAR_LOADING());
  } catch (error) {
    if (!payload.quiet) console.error(error); // eslint-disable-line no-console
    yield put(INITIALISE_ERROR({ error }));
    yield put(CLEAR_LOADING());
  }
}

export function* fetchNamespacesSaga( { payload = {} }) {
  try {
    const data = yield call(getNamespacesForService, payload.serviceId);
    if (!data.count) return;
    yield put(SET_NAMESPACES({
      data: data.items,
    }));
  } catch(error) {
    if (!payload.quiet) console.error(error); // eslint-disable-line no-console
    yield put(INITIALISE_ERROR({ error }));
  }
}

export function* triggerDeploymentSaga({ payload: formValues }, options = {}) {
  if (!formValues.registry) return yield put(submitForm.failure(new SubmissionError({ registry: 'A registry is required' })));
  if (!formValues.service) return yield put(submitForm.failure(new SubmissionError({ service: 'A service name is required' })));
  if (!formValues.version) return yield put(submitForm.failure(new SubmissionError({ version: 'A version is required' })));
  if (!formValues.namespace) return yield put(submitForm.failure(new SubmissionError({ namespace: 'A namespace is required' })));

  const namespaces = yield select(selectNamespaces);
  const selectedNamespace = namespaces.find(({id}) => (id === formValues.namespace));
  const payload = {
    registry: formValues.registry,
    service: formValues.service,
    version: formValues.version,
    namespace: selectedNamespace.name,
    cluster: selectedNamespace.cluster.name,
    secret: formValues.secret,
  };

  let data;
  try {
    data = yield call(makeDeployment, payload, options);
  } catch(err) {
    if (!options.quiet) console.error(err); // eslint-disable-line no-console
    if (err.data && err.data.id) {
      yield put(submitForm.failure({ _error: err.message || 'Something bad and unknown happened.' }));
      return yield put(push(`/deployments/${err.data.id}`));
    }
    return yield put(submitForm.failure(new SubmissionError({ _error: err.message || 'Something bad and unknown happened.' })));
  }
  yield put(submitForm.success());
  const { id } = data;
  yield put(push(`/deployments/${id}`));
}

export function* fetchServiceSuggestionsSaga({ payload = {} }) {
  const currentValue = yield select(getDeployFormValues);
  try {
    const results = yield call(getServiceSuggestions, currentValue.registry, currentValue.service);
    yield put(setServiceSuggestions(results.map(({ name }) => (name))));
  } catch (error) {
    if (!payload.quiet) console.error(error); // eslint-disable-line no-console
  }
}

export function* useServiceSuggestionsSaga({ payload }) {
  const { registry } = yield select(getDeployFormValues);
  yield put(change('deploy', 'service', payload));
  yield put(clearServiceSuggestions());
  yield put(validateService());
  yield put(fetchLatestDeploymentsPerNamespace({ service: payload, registry }));
}

const formFieldsOrder = [
  'registry',
  'service',
  'version',
  'namespace',
  'secret'
];
export function* clearFormFieldsSaga({ payload }) {
  const index = formFieldsOrder.indexOf(payload.source);
  if (index < 0) return;
  const fields = formFieldsOrder.slice(index + 1);
  // yield put(clearFields('deploy', false, false, ...fields)); // This has a bug in redux-form
  yield all(fields.map(field => put(change('deploy', field, ''))));
}

export function* validateServiceSaga({ type, payload: options = {} }) {
  const formValues = yield select(getDeployFormValues);

  const { service, registry } = formValues;
  if (!service) return;
  try {
    yield put(startAsyncValidation('deploy', 'service'));
    const data = yield call(getReleases, { service, registry });
    if (data.count === 0) {
      yield put(stopAsyncValidation('deploy', { service: `'${registry}/${service}' does not exist`}));
      return;
    }
    yield put(stopAsyncValidation('deploy'));
    const serviceId = data.items[0].service.id;
    yield put(fetchNamespacesForService({ serviceId, ...options }));
    yield put(fetchLatestDeploymentsPerNamespace({ service, registry }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(stopAsyncValidation('deploy', { service: 'There was an error looking up services' }));
  }
}

export function* validateVersionSaga({ payload: { newValue: version, ...options } }) {
  const { service, registry } = yield select(getDeployFormValues);
  if (!version) return;
  try {
    yield put(startAsyncValidation('deploy', 'version'));
    const data = yield call(getReleases, { service, registry, version });
    if (data.count === 0) {
      yield put(stopAsyncValidation('deploy', { version: `'${registry}/${service}@${version}' does not exist`}));
      return;
    }
    yield put(stopAsyncValidation('deploy'));

  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(stopAsyncValidation('deploy', { version: 'There was an error looking up versions' }));
  }
}

export function* fetchLatestDeploymentsPerNamespaceSaga({ payload: { service, registry, ...options }}) {
  try {
    const data = yield call(getLatestDeploymentsByNamespaceForService, { registry, service });
    yield put(SET_DEPLOYMENTS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
  }
}

export function* fetchSecretVersionsSaga(payload) {
  const { registry, service, version, namespaceId } = payload;
  if (!registry || !service || !version || !namespaceId) return;
  try {
    const results = yield call(getSecretVersions, registry, service, namespaceId);
    yield put(setSecretVersions(results));
    const { secret: currentSecretValue } = yield select(getDeployFormValues);
    if (currentSecretValue) return;
    const latestDeployed = yield call(getLatestDeployedSecretVersion, registry, service, version, namespaceId);
    if (latestDeployed) yield put(change('deploy', 'secret', latestDeployed.id));
  } catch (error) {
    if (!payload.quiet) console.error(error); // eslint-disable-line no-console
  }
}

export function* fetchSecretsInitProxySaga() {
  const currentValue = yield select(getDeployFormValues);
  if (!currentValue.namespace) return;

  let namespaces = yield select(selectNamespaces);
  if (!namespaces.length) {
    yield take(SET_NAMESPACES);
    namespaces = yield select(selectNamespaces);
  }

  const namespace = namespaces.find(({ id }) => (currentValue.namespace === id));
  if (!namespace) {
    console.error(`looking for ${currentValue}/${currentValue.namespace} but not found in deployable namespaces for current service ${currentValue.registry}/${currentValue.service}`); // eslint-disable-line no-console
    return;
  }

  yield call(fetchSecretVersionsSaga, {
    registry: currentValue.registry,
    service: currentValue.service,
    version: currentValue.version,
    namespaceId: namespace.id,
  });
}

export function* fetchSecretsNamespaceChangedProxySaga({ payload = {} }) {
  const currentValue = yield select(getDeployFormValues);
  const namespaceId = payload.id;

  yield call(fetchSecretVersionsSaga, {
    registry: currentValue.registry,
    service: currentValue.service,
    version: currentValue.version,
    namespaceId,
  });
}

export function* initSaga({ payload = {} }) {
  const {
      registry,
      service,
      version,
      namespace,
      secret,
  } = parseQueryString(payload.location.search);
  yield put(SET_INITIAL_FORM_VALUES({
      registry,
      service,
      version,
      namespace,
      secret,
  }));
  yield call(fetchRegistriesSaga, {});
  yield call(validateServiceSaga, {});
  yield call(validateVersionSaga, validateVersion({ newValue: version }));
  yield call(fetchSecretsInitProxySaga, {});
}

export default [
  takeLatest(INITIALISE, initSaga),
  takeLatest(fetchNamespacesForService, fetchNamespacesSaga),
  takeLatest(submitForm.REQUEST, triggerDeploymentSaga),
  takeLatest(fetchServiceSuggestions, fetchServiceSuggestionsSaga),
  takeLatest(useServiceSuggestion, useServiceSuggestionsSaga),
  takeEvery(clearFormFields, clearFormFieldsSaga),
  takeLatest(validateService, validateServiceSaga),
  takeLatest(validateVersion, validateVersionSaga),
  takeLatest(fetchLatestDeploymentsPerNamespace, fetchLatestDeploymentsPerNamespaceSaga),
  takeLatest(fetchSecretVersions, fetchSecretsNamespaceChangedProxySaga),
];

import { takeEvery, takeLatest, call, put, select } from 'redux-saga/effects';
import {
  SubmissionError,
  change,
  clearFields,
  stopAsyncValidation,
  startAsyncValidation
} from 'redux-form';
import { push } from 'connected-react-router';

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
  INITIALISE,
  INITIALISE_ERROR,
  SET_LOADING,
  CLEAR_LOADING,
  SET_REGISTRIES,
  SET_NAMESPACES,
} from '../modules/deploy';

import {
  makeDeployment,
  getRegistries,
  getNamespacesForService,
  getServiceSuggestions,
  getReleases,
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
      data: data.items.map(({ name, cluster }) => ({ name, cluster })),
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
  if (!formValues.cluster) return yield put(submitForm.failure(new SubmissionError({ cluster: 'A cluster destination is required' })));
  if (!formValues.namespace) return yield put(submitForm.failure(new SubmissionError({ namespace: 'A namespace is required' })));

  let data;
  try {
    data = yield call(makeDeployment, formValues, options);
  } catch(err) {
    if (!options.quiet) console.error(err); // eslint-disable-line no-console
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
  yield put(change('deploy', 'service', payload));
  yield put(clearServiceSuggestions());
}

const formFieldsOrder = [
  'registry',
  'service',
  'version',
  'cluster',
  'namespace',
];
export function* clearFormFieldsSaga({ payload }) {
  const index = formFieldsOrder.indexOf(payload.source);
  if (index < 0) return;
  const fields = formFieldsOrder.slice(index + 1);
  yield put(clearFields('deploy', false, false, ...fields));
}

export function* validateServiceSaga({ payload: options = {} }) {
  const { service, registry } = yield select(getDeployFormValues);
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

export default [
  takeEvery(INITIALISE, fetchRegistriesSaga),
  takeEvery(INITIALISE, validateServiceSaga),
  takeEvery(fetchNamespacesForService, fetchNamespacesSaga),
  takeEvery(submitForm.REQUEST, triggerDeploymentSaga),
  takeEvery(fetchServiceSuggestions, fetchServiceSuggestionsSaga),
  takeEvery(useServiceSuggestion, useServiceSuggestionsSaga),
  takeEvery(clearFormFields, clearFormFieldsSaga),
  takeLatest(validateService, validateServiceSaga),
  takeLatest(validateVersion, validateVersionSaga),
];

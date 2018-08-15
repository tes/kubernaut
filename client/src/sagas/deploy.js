import { takeEvery, call, put, select } from 'redux-saga/effects';
import { SubmissionError, change, clearFields } from 'redux-form';
import { push } from 'connected-react-router';

import {
  submitForm,
  fetchServiceSuggestions,
  setServiceSuggestions,
  useServiceSuggestion,
  clearServiceSuggestions,
  getDeployFormValues,
  clearFormFields,
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
  getNamespaces,
  getServiceSuggestions,
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
    const data = yield call(getNamespaces);
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

export default [
  takeEvery(INITIALISE, fetchRegistriesSaga),
  takeEvery(INITIALISE, fetchNamespacesSaga),
  takeEvery(submitForm.REQUEST, triggerDeploymentSaga),
  takeEvery(fetchServiceSuggestions, fetchServiceSuggestionsSaga),
  takeEvery(useServiceSuggestion, useServiceSuggestionsSaga),
  takeEvery(clearFormFields, clearFormFieldsSaga),
];

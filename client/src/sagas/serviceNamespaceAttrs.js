import { takeEvery, takeLatest, call, put, select } from 'redux-saga/effects';
import { SubmissionError } from 'redux-form';
import { push } from 'connected-react-router';

import {
  initForm,
  submitForm,
  selectNamespace,
  FETCH_NAMESPACE_REQUEST,
  FETCH_NAMESPACE_SUCCESS,
  FETCH_NAMESPACE_ERROR,
  FETCH_ATTRIBUTES_REQUEST,
  FETCH_ATTRIBUTES_SUCCESS,
  FETCH_ATTRIBUTES_ERROR,
  canManageRequest,
  setCanManage,
} from '../modules/serviceNamespaceAttrs';
import {
  getNamespace,
  getServiceAttributesForNamespace,
  setServiceAttributesForNamespace,
  hasPermissionOn
} from '../lib/api';

export function* checkPermissionSaga({ payload: { match, ...options }}) {
  try {
    yield put(canManageRequest());
    const hasPermission = yield call(hasPermissionOn, 'namespaces-manage', 'namespace', match.params.namespaceId);
    yield put(setCanManage(hasPermission.answer));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
  }
}

export function* fetchNamespaceInfoSaga({ payload: { match, ...options } }) {
  if (!match) return;
  const { namespaceId } = match.params;
  yield put(FETCH_NAMESPACE_REQUEST());
  try {
    const data = yield call(getNamespace, namespaceId);
    yield put(FETCH_NAMESPACE_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_NAMESPACE_ERROR({ error: error.message }));
  }
}

export function* fetchAttributesSaga({ payload: { match, ...options } }) {
  const { registry, name: service, namespaceId } = match.params;
  if (!registry || !service || !namespaceId) return;

  yield put(FETCH_ATTRIBUTES_REQUEST());
  try {
    const data = yield call(getServiceAttributesForNamespace, registry, service, namespaceId);
    yield put(FETCH_ATTRIBUTES_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_ATTRIBUTES_ERROR({ error: error.message }));
  }
}

export function* saveAttributesSaga({ payload: formValues }, options = {}) {
  const { id } = yield select(selectNamespace);
  const { attributes = [], registry, service } = formValues;

  const attrs = attributes.reduce((acc, { name, value }) => {
    return (acc[name] = value, acc);
  }, {});
  try {
    yield call(setServiceAttributesForNamespace, registry, service, id, attrs);
  } catch(err) {
    if (!options.quiet) console.error(err); // eslint-disable-line no-console
    return yield put(submitForm.failure(new SubmissionError({ _error: err.message || 'Something bad and unknown happened.' })));
  }
  yield put(submitForm.success());
  yield put(push(`/services/${registry}/${service}/manage`));
}

export default [
  takeLatest(initForm, checkPermissionSaga),
  takeLatest(initForm, fetchNamespaceInfoSaga),
  takeLatest(initForm, fetchAttributesSaga),
  takeEvery(submitForm.REQUEST, saveAttributesSaga),
];

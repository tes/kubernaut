import { takeEvery, call, put, all, select } from 'redux-saga/effects';
import { SubmissionError } from 'redux-form';
import { push } from 'connected-react-router';

import {
  initForm,
  submitForm,
  selectNamespaceId,
  FETCH_NAMESPACE_REQUEST,
  FETCH_NAMESPACE_SUCCESS,
  FETCH_NAMESPACE_ERROR,
  FETCH_CLUSTERS_REQUEST,
  FETCH_CLUSTERS_SUCCESS,
  FETCH_CLUSTERS_ERROR,
} from '../modules/namespaceEdit';
import { getNamespace, getClusters, editNamespace } from '../lib/api';

export function* initFormSaga(action) {
  yield all([
    call(fetchNamespaceInfoSaga, action),
    call(fetchClustersSaga, action),
  ]);
}

export function* fetchClustersSaga({ payload }) {
  yield put(FETCH_CLUSTERS_REQUEST());
  try {
    const data = yield call(getClusters);
    yield put(FETCH_CLUSTERS_SUCCESS({ data }));
  } catch(error) {
    if (!payload.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_CLUSTERS_ERROR({ error: error.message }));
  }
}

export function* fetchNamespaceInfoSaga({ payload: { id, ...options } }) {
  yield put(FETCH_NAMESPACE_REQUEST());
  try {
    const data = yield call(getNamespace, id);
    yield put(FETCH_NAMESPACE_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_NAMESPACE_ERROR({ error: error.message }));
  }
}

export function* editNamespaceSaga({ payload: formValues }, options = {}) {
  const id = yield select(selectNamespaceId);
  const { attributes = [], ...data } = formValues;

  data.attributes = attributes.reduce((acc, { name, value }) => {
    return (acc[name] = value, acc);
  }, {});
  try {
    yield call(editNamespace, id, data, options);
  } catch(err) {
    if (!options.quiet) console.error(err); // eslint-disable-line no-console
    return yield put(submitForm.failure(new SubmissionError({ _error: err.message || 'Something bad and unknown happened.' })));
  }
  yield put(submitForm.success());
  yield put(push(`/namespaces/${id}`));
}

export default [
  takeEvery(initForm, initFormSaga),
  takeEvery(submitForm.REQUEST, editNamespaceSaga),
];

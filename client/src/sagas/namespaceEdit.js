import { takeEvery, call, put, all } from 'redux-saga/effects';
import {
  initForm,
  FETCH_NAMESPACE_REQUEST,
  FETCH_NAMESPACE_SUCCESS,
  FETCH_NAMESPACE_ERROR,
  FETCH_CLUSTERS_REQUEST,
  FETCH_CLUSTERS_SUCCESS,
  FETCH_CLUSTERS_ERROR,
} from '../modules/namespaceEdit';
import { getNamespace, getClusters } from '../lib/api';

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

export default [
  takeEvery(initForm, initFormSaga),
];

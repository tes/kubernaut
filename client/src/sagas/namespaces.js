import { takeLatest, call, put } from 'redux-saga/effects';

import {
  fetchNamespacesPagination,
  FETCH_NAMESPACES_REQUEST,
  FETCH_NAMESPACES_SUCCESS,
  FETCH_NAMESPACES_ERROR,
} from '../modules/namespaces';

import { getNamespaces } from '../lib/api';

export function* fetchNamespacesDataSaga({ payload = {} }) {
  const { page = 1, limit = 50, ...options } = payload;
  const offset = (page - 1) * limit;

  yield put(FETCH_NAMESPACES_REQUEST());
  try {
    const data = yield call(getNamespaces, { offset, limit });
    yield put(FETCH_NAMESPACES_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_NAMESPACES_ERROR({ error: error.message }));
  }
}

export default [
  takeLatest(fetchNamespacesPagination, fetchNamespacesDataSaga),
];

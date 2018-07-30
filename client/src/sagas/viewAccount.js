import { takeEvery, call, put } from 'redux-saga/effects';

import {
  fetchAccountInfo,
  FETCH_ACCOUNT_REQUEST,
  FETCH_ACCOUNT_SUCCESS,
  FETCH_ACCOUNT_ERROR,
  FETCH_NAMESPACES_REQUEST,
  FETCH_NAMESPACES_SUCCESS,
  FETCH_NAMESPACES_ERROR,
  FETCH_REGISTRIES_REQUEST,
  FETCH_REGISTRIES_SUCCESS,
  FETCH_REGISTRIES_ERROR,
} from '../modules/viewAccount';

import {
  getAccountById,
  getNamespaces,
  getRegistries,
} from '../lib/api';

export function* fetchAccountInfoSaga({ payload = {} }) {
  const { accountId, ...options } = payload;

  yield put(FETCH_ACCOUNT_REQUEST());
  try {
    const data = yield call(getAccountById, accountId);
    yield put(FETCH_ACCOUNT_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_ACCOUNT_ERROR({ error: error.message }));
  }
}

export function* fetchNamespacesSaga({ payload: options }) {
  yield put(FETCH_NAMESPACES_REQUEST());
  try {
    const data = yield call(getNamespaces);
    yield put(FETCH_NAMESPACES_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_NAMESPACES_ERROR({ error: error.message }));
  }
}

export function* fetchRegistriesSaga({ payload: options }) {
  yield put(FETCH_REGISTRIES_REQUEST());
  try {
    const data = yield call(getRegistries);
    yield put(FETCH_REGISTRIES_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_REGISTRIES_ERROR({ error: error.message }));
  }
}

export default [
  takeEvery(fetchAccountInfo, fetchAccountInfoSaga),
  takeEvery(fetchAccountInfo, fetchNamespacesSaga),
  takeEvery(fetchAccountInfo, fetchRegistriesSaga),
];

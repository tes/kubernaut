import { takeLatest, call, put } from 'redux-saga/effects';

import {
  fetchAccountInfo,
  FETCH_ACCOUNT_REQUEST,
  FETCH_ACCOUNT_SUCCESS,
  FETCH_ACCOUNT_ERROR,
  setCanEdit,
} from '../modules/viewAccount';

import {
  getAccountById,
  hasPermission,
} from '../lib/api';

export function* fetchAccountInfoSaga({ payload = {} }) {
  const { match, ...options } = payload;
  if (!match) return;
  const { accountId } = match.params;

  yield put(FETCH_ACCOUNT_REQUEST());
  try {
    const data = yield call(getAccountById, accountId);
    yield put(FETCH_ACCOUNT_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_ACCOUNT_ERROR({ error: error.message }));
  }
}

export function* checkPermissionSaga({ payload = {}}) {
  try {
    const result = yield call(hasPermission, 'accounts-write');
    yield put(setCanEdit(result.answer));
  } catch(error) {
    console.error(error); // eslint-disable-line no-console
  }
}

export default [
  takeLatest(fetchAccountInfo, fetchAccountInfoSaga),
  takeLatest(fetchAccountInfo, checkPermissionSaga),
];

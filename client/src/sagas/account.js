import { takeLatest, call, put } from 'redux-saga/effects';

import {
  fetchAccountInfo,
  FETCH_ACCOUNT_REQUEST,
  FETCH_ACCOUNT_SUCCESS,
  FETCH_ACCOUNT_ERROR,
  setPermission,
} from '../modules/account';

import { getAccount, hasPermission } from '../lib/api';

export function* fetchAccountInfoSaga({ payload = {} }) {
  const { ...options } = payload;

  yield put(FETCH_ACCOUNT_REQUEST());
  try {
    const data = yield call(getAccount);
    yield put(FETCH_ACCOUNT_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_ACCOUNT_ERROR({ error: error.message }));
  }
}

export function* checkPermissionSaga({ payload: { data, ...options } }) {
  try {
    const jobsRead = yield call(hasPermission, 'jobs-read');
    yield put(setPermission({ permission: 'jobs-read', answer: jobsRead.answer }));
    const auditRead = yield call(hasPermission, 'audit-read');
    yield put(setPermission({ permission: 'audit-read', answer: auditRead.answer }));
  } catch(error) {
    console.error(error); // eslint-disable-line no-console
  }
}

export default [
  takeLatest(fetchAccountInfo, fetchAccountInfoSaga),
  takeLatest(FETCH_ACCOUNT_SUCCESS, checkPermissionSaga),
];

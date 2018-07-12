import { takeEvery, call, put } from 'redux-saga/effects';

import {
  fetchAccountsPagination,
  FETCH_ACCOUNTS_REQUEST,
  FETCH_ACCOUNTS_SUCCESS,
  FETCH_ACCOUNTS_ERROR,
} from '../modules/accounts';

import { getAccounts } from '../lib/api';

export function* fetchAccountsDataSaga({ payload = {} }) {
  const { page = 1, limit = 50, ...options } = payload;
  const offset = (page - 1) * limit;

  yield put(FETCH_ACCOUNTS_REQUEST());
  try {
    const data = yield call(getAccounts, { offset, limit });
    yield put(FETCH_ACCOUNTS_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_ACCOUNTS_ERROR({ error: error.message }));
  }
}

export default [
  takeEvery(fetchAccountsPagination, fetchAccountsDataSaga),
];

import { takeLatest, call, put } from 'redux-saga/effects';

import {
  fetchAccountInfo,
  FETCH_ACCOUNT_REQUEST,
  FETCH_ACCOUNT_SUCCESS,
  FETCH_ACCOUNT_ERROR,
} from '../modules/account';

import { getAccount } from '../lib/api';

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

export default [
  takeLatest(fetchAccountInfo, fetchAccountInfoSaga),
];

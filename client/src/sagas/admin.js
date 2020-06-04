import { takeLatest, call, put } from 'redux-saga/effects';
import {
  initAdminPage,
  FETCH_SUMMARY_REQUEST,
  FETCH_SUMMARY_SUCCESS,
  FETCH_SUMMARY_ERROR,
} from '../modules/admin';

import {
  getAdminSummary,
} from '../lib/api';

export function* fetchSummaryDataSaga({ payload = {} }) {
  yield put(FETCH_SUMMARY_REQUEST());
  try {
    const data = yield call(getAdminSummary);
    yield put(FETCH_SUMMARY_SUCCESS({ data }));
  } catch(error) {
    if (!payload.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_SUMMARY_ERROR({ error: error.message }));
  }
}

export default [
  takeLatest(initAdminPage, fetchSummaryDataSaga),
];

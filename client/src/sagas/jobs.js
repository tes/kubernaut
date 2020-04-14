import { takeLatest, call, put } from 'redux-saga/effects';

import {
  fetchJobsPagination,
  FETCH_JOBS_REQUEST,
  FETCH_JOBS_SUCCESS,
  FETCH_JOBS_ERROR,
} from '../modules/jobs';

import { getJobs } from '../lib/api';

export function* fetchJobsDataSaga({ payload = {} }) {
  const { page = 1, limit = 20, ...options } = payload;
  const offset = (page - 1) * limit;

  yield put(FETCH_JOBS_REQUEST());
  try {
    const data = yield call(getJobs, { offset, limit });
    yield put(FETCH_JOBS_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_JOBS_ERROR({ error: error.message }));
  }
}

export default [
  takeLatest(fetchJobsPagination, fetchJobsDataSaga),
];

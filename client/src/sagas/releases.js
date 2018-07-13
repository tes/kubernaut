import { takeEvery, call, put } from 'redux-saga/effects';

import {
  fetchReleasesPagination,
  FETCH_RELEASES_REQUEST,
  FETCH_RELEASES_SUCCESS,
  FETCH_RELEASES_ERROR,
} from '../modules/releases';

import { getReleases } from '../lib/api';

export function* fetchReleasesDataSaga({ payload = {} }) {
  const { page = 1, limit = 50, ...options } = payload;
  const offset = (page - 1) * limit;

  yield put(FETCH_RELEASES_REQUEST());
  try {
    const data = yield call(getReleases, { offset, limit });
    yield put(FETCH_RELEASES_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_RELEASES_ERROR({ error: error.message }));
  }
}

export default [
  takeEvery(fetchReleasesPagination, fetchReleasesDataSaga),
];

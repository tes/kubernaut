import { takeLatest, call, put } from 'redux-saga/effects';

import {
  fetchRegistriesPagination,
  FETCH_REGISTRIES_REQUEST,
  FETCH_REGISTRIES_SUCCESS,
  FETCH_REGISTRIES_ERROR,
} from '../modules/registries';

import { getRegistries } from '../lib/api';

export function* fetchRegistriesDataSaga({ payload = {} }) {
  const { page = 1, limit = 50, ...options } = payload;
  const offset = (page - 1) * limit;

  yield put(FETCH_REGISTRIES_REQUEST());
  try {
    const data = yield call(getRegistries, { offset, limit });
    yield put(FETCH_REGISTRIES_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_REGISTRIES_ERROR({ error: error.message }));
  }
}

export default [
  takeLatest(fetchRegistriesPagination, fetchRegistriesDataSaga),
];

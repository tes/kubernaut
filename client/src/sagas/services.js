import { takeEvery, call, put } from 'redux-saga/effects';

import {
  fetchServicesPagination,
  FETCH_SERVICES_REQUEST,
  FETCH_SERVICES_SUCCESS,
  FETCH_SERVICES_ERROR,
} from '../modules/services';

import { getServices } from '../lib/api';

export function* fetchServicesDataSaga({ payload = {} }) {
  const { page = 1, limit = 50, ...options } = payload;
  const offset = (page - 1) * limit;

  yield put(FETCH_SERVICES_REQUEST());
  try {
    const data = yield call(getServices, { offset, limit });
    yield put(FETCH_SERVICES_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_SERVICES_ERROR({ error: error.message }));
  }
}

export default [
  takeEvery(fetchServicesPagination, fetchServicesDataSaga),
];

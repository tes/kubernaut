import { takeEvery, call, put, select } from 'redux-saga/effects';

import {
  fetchServicesPagination,
  toggleSort,
  FETCH_SERVICES_REQUEST,
  FETCH_SERVICES_SUCCESS,
  FETCH_SERVICES_ERROR,
  selectSortState,
} from '../modules/services';

import { getServices } from '../lib/api';

export function* fetchServicesDataSaga({ payload = {} }) {
  const {
    page = 1,
    limit = 50,
    sort = 'name',
    order = 'asc',
    ...options
  } = payload;
  const offset = (page - 1) * limit;

  yield put(FETCH_SERVICES_REQUEST());
  try {
    const data = yield call(getServices, { offset, limit, sort, order });
    yield put(FETCH_SERVICES_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_SERVICES_ERROR({ error: error.message }));
  }
}

export function* sortSaga({ payload = {} }) {
  const { column, order } = yield select(selectSortState);
  yield put(fetchServicesPagination({ sort: column, order }));
}

export default [
  takeEvery(fetchServicesPagination, fetchServicesDataSaga),
  takeEvery(toggleSort, sortSaga),
];

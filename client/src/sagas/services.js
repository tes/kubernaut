import { takeEvery, call, put, select } from 'redux-saga/effects';
import { reset } from 'redux-form';
import {
  fetchServicesPagination,
  toggleSort,
  FETCH_SERVICES_REQUEST,
  FETCH_SERVICES_SUCCESS,
  FETCH_SERVICES_ERROR,
  selectSortState,
  selectTableFilters,
  addFilter,
  removeFilter,
  search,
  clearSearch,
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

  const filters = yield select(selectTableFilters);
  yield put(FETCH_SERVICES_REQUEST());
  try {
    const data = yield call(getServices, { offset, limit, sort, order, filters });
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

export function* addFilterSaga() {
  const { column, order } = yield select(selectSortState);
  yield put(reset('services_table_filter'));
  yield put(fetchServicesPagination({ sort: column, order }));
}

export function* removeFilterSaga() {
  const { column, order } = yield select(selectSortState);
  yield put(fetchServicesPagination({ sort: column, order }));
}

export function* clearSearchSaga() {
  const { column, order } = yield select(selectSortState);
  yield put(reset('services_table_filter'));
  yield put(fetchServicesPagination({ sort: column, order }));
}

export default [
  takeEvery(fetchServicesPagination, fetchServicesDataSaga),
  takeEvery(addFilter, addFilterSaga),
  takeEvery(removeFilter, removeFilterSaga),
  takeEvery(toggleSort, sortSaga),
  takeEvery(search, fetchServicesDataSaga),
  takeEvery(clearSearch, clearSearchSaga),
];

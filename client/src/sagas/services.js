import { takeEvery, call, put, select } from 'redux-saga/effects';
import { reset } from 'redux-form';
import { push, getLocation, LOCATION_CHANGE } from 'connected-react-router';
import { parseFiltersFromQS, stringifyFiltersForQS } from '../modules/lib/filter';
import {
  extractFromQuery,
  alterQuery,
  makeQueryString,
  parseQueryString,
 } from './lib/query';
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
  setFilters,
  setSort,
} from '../modules/services';

import { getServices } from '../lib/api';

export function* fetchServicesDataSaga({ payload = {} }) {
  const {
    page = 1,
    limit = 50,
    ...options
  } = payload;
  const offset = (page - 1) * limit;
  const { column, order } = yield select(selectSortState);
  const filters = yield select(selectTableFilters);
  yield put(FETCH_SERVICES_REQUEST());
  try {
    const data = yield call(getServices, { offset, limit, sort: column, order, filters });
    yield put(FETCH_SERVICES_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_SERVICES_ERROR({ error: error.message }));
  }
}

export function* addFilterSaga() {
  yield put(reset('services_table_filter'));
  const location = yield select(getLocation);
  const filters = yield select(selectTableFilters);
  yield put(push(`/services?${alterQuery(location.search, { filters: stringifyFiltersForQS(filters) })}`));
}

export function* removeFilterSaga() {
  const location = yield select(getLocation);
  const filters = yield select(selectTableFilters);
  yield put(push(`/services?${alterQuery(location.search, { filters: stringifyFiltersForQS(filters) })}`));
}

export function* clearSearchSaga() {
  yield put(reset('services_table_filter'));
  yield put(fetchServicesPagination());
}

export function* toggleSortSaga() {
  const location = yield select(getLocation);
  const sort = yield select(selectSortState);
  yield put(push(`/services?${alterQuery(location.search, { sort: makeQueryString({ ...sort }) })}`));
}

export function* locationChangeSaga({ payload = {} }) {
  if (payload.location.pathname !== '/services') return;

  const filters = parseFiltersFromQS(extractFromQuery(payload.location.search, 'filters') || '');
  const sort = parseQueryString(extractFromQuery(payload.location.search, 'sort') || '');
  yield put(setFilters(filters));
  yield put(setSort(sort));
  yield put(fetchServicesPagination());
}

export default [
  takeEvery(fetchServicesPagination, fetchServicesDataSaga),
  takeEvery(addFilter, addFilterSaga),
  takeEvery(removeFilter, removeFilterSaga),
  takeEvery(toggleSort, toggleSortSaga),
  takeEvery(search, fetchServicesDataSaga),
  takeEvery(clearSearch, clearSearchSaga),
  takeEvery(LOCATION_CHANGE, locationChangeSaga),
];

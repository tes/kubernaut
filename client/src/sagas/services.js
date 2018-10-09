import { takeEvery, call, put, select } from 'redux-saga/effects';
import { reset } from 'redux-form';
import { push, getLocation, LOCATION_CHANGE } from 'connected-react-router';
import {
  parseFiltersFromQS,
  parseSearchFromQS,
  stringifyFiltersForQS,
  stringifySearchForQS,
} from '../modules/lib/filter';
import {
  extractFromQuery,
  alterQuery,
  makeQueryString,
  parseQueryString,
 } from './lib/query';
import {
  fetchServices,
  fetchServicesPagination,
  toggleSort,
  FETCH_SERVICES_REQUEST,
  FETCH_SERVICES_SUCCESS,
  FETCH_SERVICES_ERROR,
  selectSortState,
  selectTableFilters,
  selectSearchFilter,
  selectPaginationState,
  addFilter,
  removeFilter,
  search,
  clearSearch,
  setFilters,
  setSearch,
  setSort,
  setPagination,
} from '../modules/services';

import { getServices } from '../lib/api';

export function* fetchServicesDataSaga({ payload = {} }) {
  const options = payload;
  const { page, limit } = yield select(selectPaginationState);
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
  yield put(push(`/services?${alterQuery(location.search, {
    filters: stringifyFiltersForQS(filters),
    pagination: null,
    search: null,
  })}`));
}

export function* removeFilterSaga() {
  const location = yield select(getLocation);
  const filters = yield select(selectTableFilters);
  yield put(push(`/services?${alterQuery(location.search, {
    filters: stringifyFiltersForQS(filters),
    pagination: null,
  })}`));
}

export function* searchSaga() {
  const location = yield select(getLocation);
  const searchFilter = yield select(selectSearchFilter);
  yield put(push(`/services?${alterQuery(location.search, {
    search: stringifySearchForQS(searchFilter),
    pagination: null,
  })}`));
}

export function* toggleSortSaga() {
  const location = yield select(getLocation);
  const sort = yield select(selectSortState);
  yield put(push(`/services?${alterQuery(location.search, {
    sort: makeQueryString({ ...sort }),
    pagination: null,
  })}`));
}

export function* paginationSaga() {
  const location = yield select(getLocation);
  const pagination = yield select(selectPaginationState);
  yield put(push(`/services?${alterQuery(location.search, { pagination: makeQueryString({ ...pagination }) })}`));
}

export function* locationChangeSaga({ payload = {} }) {
  if (payload.location.pathname !== '/services') return;

  const filters = parseFiltersFromQS(extractFromQuery(payload.location.search, 'filters') || '');
  const search = parseSearchFromQS(extractFromQuery(payload.location.search, 'search') || '');
  const sort = parseQueryString(extractFromQuery(payload.location.search, 'sort') || '');
  const pagination = parseQueryString(extractFromQuery(payload.location.search, 'pagination') || '');
  yield put(setFilters(filters));
  yield put(setSearch(search));
  yield put(setSort(sort));
  yield put(setPagination(pagination));
  yield put(fetchServices());
}

export default [
  takeEvery(fetchServices, fetchServicesDataSaga),
  takeEvery(fetchServicesPagination, paginationSaga),
  takeEvery(addFilter, addFilterSaga),
  takeEvery(removeFilter, removeFilterSaga),
  takeEvery(toggleSort, toggleSortSaga),
  takeEvery(search, searchSaga),
  takeEvery(clearSearch, searchSaga),
  takeEvery(LOCATION_CHANGE, locationChangeSaga),
];

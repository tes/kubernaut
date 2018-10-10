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
  fetchReleases,
  fetchReleasesPagination,
  toggleSort,
  FETCH_RELEASES_REQUEST,
  FETCH_RELEASES_SUCCESS,
  FETCH_RELEASES_ERROR,
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
} from '../modules/releases';

import { getReleases } from '../lib/api';

const pageUrl = '/releases';

export function* fetchReleasesDataSaga({ payload = {} }) {
  const options = payload;
  const { page, limit } = yield select(selectPaginationState);
  const offset = (page - 1) * limit;
  const { column, order } = yield select(selectSortState);
  const filters = yield select(selectTableFilters, true);
  yield put(FETCH_RELEASES_REQUEST());
  try {
    const data = yield call(getReleases, { offset, limit, sort: column, order, filters });
    yield put(FETCH_RELEASES_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_RELEASES_ERROR({ error: error.message }));
  }
}

export function* sortSaga({ payload = {} }) {
  const location = yield select(getLocation);
  const sort = yield select(selectSortState);
  yield put(push(`${pageUrl}?${alterQuery(location.search, {
    sort: makeQueryString({ ...sort }),
    pagination: null,
  })}`));
}
export function* addFilterSaga() {
  yield put(reset('releases_table_filter'));
  const location = yield select(getLocation);
  const filters = yield select(selectTableFilters);
  yield put(push(`${pageUrl}?${alterQuery(location.search, {
    filters: stringifyFiltersForQS(filters),
    pagination: null,
    search: null,
  })}`));
}

export function* removeFilterSaga() {
  const location = yield select(getLocation);
  const filters = yield select(selectTableFilters);
  yield put(push(`${pageUrl}?${alterQuery(location.search, {
    filters: stringifyFiltersForQS(filters),
    pagination: null,
  })}`));
}

export function* searchSaga() {
  const location = yield select(getLocation);
  const searchFilter = yield select(selectSearchFilter);
  yield put(push(`${pageUrl}?${alterQuery(location.search, {
    search: stringifySearchForQS(searchFilter),
    pagination: null,
  })}`));
}

export function* paginationSaga() {
  const location = yield select(getLocation);
  const pagination = yield select(selectPaginationState);
  yield put(push(`${pageUrl}?${alterQuery(location.search, { pagination: makeQueryString({ ...pagination }) })}`));
}

export function* locationChangeSaga({ payload = {} }) {
  if (payload.location.pathname !== pageUrl) return;

  const filters = parseFiltersFromQS(extractFromQuery(payload.location.search, 'filters') || '');
  const search = parseSearchFromQS(extractFromQuery(payload.location.search, 'search') || '');
  const sort = parseQueryString(extractFromQuery(payload.location.search, 'sort') || '');
  const pagination = parseQueryString(extractFromQuery(payload.location.search, 'pagination') || '');
  yield put(setFilters(filters));
  yield put(setSearch(search));
  yield put(setSort(sort));
  yield put(setPagination(pagination));
  yield put(fetchReleases());
}

export default [
  takeEvery(fetchReleases, fetchReleasesDataSaga),
  takeEvery(fetchReleasesPagination, paginationSaga),
  takeEvery(addFilter, addFilterSaga),
  takeEvery(removeFilter, removeFilterSaga),
  takeEvery(toggleSort, sortSaga),
  takeEvery(search, searchSaga),
  takeEvery(clearSearch, searchSaga),
  takeEvery(LOCATION_CHANGE, locationChangeSaga),
];

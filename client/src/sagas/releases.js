import { takeEvery, call, put, select } from 'redux-saga/effects';
import { reset } from 'redux-form';

import {
  fetchReleasesPagination,
  toggleSort,
  FETCH_RELEASES_REQUEST,
  FETCH_RELEASES_SUCCESS,
  FETCH_RELEASES_ERROR,
  selectSortState,
  selectTableFilters,
  addFilter,
  removeFilter,
  search,
  clearSearch,
} from '../modules/releases';

import { getReleases } from '../lib/api';

export function* fetchReleasesDataSaga({ payload = {} }) {
  const {
    page = 1,
    limit = 50,
    sort = 'created',
    order = 'desc',
    ...options
  } = payload;
  const offset = (page - 1) * limit;

  const filters = yield select(selectTableFilters);
  yield put(FETCH_RELEASES_REQUEST());
  try {
    const data = yield call(getReleases, { offset, limit, filters, sort, order });
    yield put(FETCH_RELEASES_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_RELEASES_ERROR({ error: error.message }));
  }
}

export function* sortSaga({ payload = {} }) {
  const { column, order } = yield select(selectSortState);
  yield put(fetchReleasesPagination({ sort: column, order }));
}
export function* addFilterSaga() {
  const { column, order } = yield select(selectSortState);
  yield put(reset('releases_table_filter'));
  yield put(fetchReleasesPagination({ sort: column, order }));
}

export function* removeFilterSaga() {
  const { column, order } = yield select(selectSortState);
  yield put(fetchReleasesPagination({ sort: column, order }));
}

export function* clearSearchSaga() {
  const { column, order } = yield select(selectSortState);
  yield put(reset('releases_table_filter'));
  yield put(fetchReleasesPagination({ sort: column, order }));
}

export default [
  takeEvery(fetchReleasesPagination, fetchReleasesDataSaga),
  takeEvery(addFilter, addFilterSaga),
  takeEvery(removeFilter, removeFilterSaga),
  takeEvery(search, fetchReleasesDataSaga),
  takeEvery(clearSearch, clearSearchSaga),
  takeEvery(toggleSort, sortSaga),
];

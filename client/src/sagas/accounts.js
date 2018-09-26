import { takeEvery, call, put, select } from 'redux-saga/effects';
import { reset } from 'redux-form';

import {
  fetchAccountsPagination,
  toggleSort,
  FETCH_ACCOUNTS_REQUEST,
  FETCH_ACCOUNTS_SUCCESS,
  FETCH_ACCOUNTS_ERROR,
  selectSortState,
  selectTableFilters,
  addFilter,
  removeFilter,
  search,
  clearSearch,
} from '../modules/accounts';

import { getAccounts } from '../lib/api';

export function* fetchAccountsDataSaga({ payload = {} }) {
  const {
    page = 1,
    limit = 50,
    sort = 'name',
    order = 'asc',
    ...options
  } = payload;
  const offset = (page - 1) * limit;

  const filters = yield select(selectTableFilters);
  yield put(FETCH_ACCOUNTS_REQUEST());
  try {
    const data = yield call(getAccounts, { offset, limit, sort, order, filters });
    yield put(FETCH_ACCOUNTS_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_ACCOUNTS_ERROR({ error: error.message }));
  }
}

export function* sortSaga({ payload = {} }) {
  const { column, order } = yield select(selectSortState);
  yield put(fetchAccountsPagination({ sort: column, order }));
}

export function* addFilterSaga() {
  const { column, order } = yield select(selectSortState);
  yield put(reset('accounts_table_filter'));
  yield put(fetchAccountsPagination({ sort: column, order }));
}

export function* removeFilterSaga() {
  const { column, order } = yield select(selectSortState);
  yield put(fetchAccountsPagination({ sort: column, order }));
}

export function* clearSearchSaga() {
  const { column, order } = yield select(selectSortState);
  yield put(reset('accounts_table_filter'));
  yield put(fetchAccountsPagination({ sort: column, order }));
}

export default [
  takeEvery(fetchAccountsPagination, fetchAccountsDataSaga),
  takeEvery(addFilter, addFilterSaga),
  takeEvery(removeFilter, removeFilterSaga),
  takeEvery(toggleSort, sortSaga),
  takeEvery(search, fetchAccountsDataSaga),
  takeEvery(clearSearch, clearSearchSaga),
];

import { takeEvery, call, put, select } from 'redux-saga/effects';
import { reset } from 'redux-form';

import {
  fetchDeploymentsPagination,
  toggleSort,
  FETCH_DEPLOYMENTS_REQUEST,
  FETCH_DEPLOYMENTS_SUCCESS,
  FETCH_DEPLOYMENTS_ERROR,
  selectSortState,
  selectTableFilters,
  addFilter,
  removeFilter,
  search,
  clearSearch,
} from '../modules/deployments';

import { getDeployments } from '../lib/api';

export function* fetchDeploymentsDataSaga({ payload = {} }) {
  const {
    page = 1,
    limit = 50,
    sort = 'created',
    order = 'desc',
    ...options } = payload;
  const offset = (page - 1) * limit;

  try {
    const filters = yield select(selectTableFilters);
    yield put(FETCH_DEPLOYMENTS_REQUEST());
    const data = yield call(getDeployments, { offset, limit, filters, sort, order });
    yield put(FETCH_DEPLOYMENTS_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_DEPLOYMENTS_ERROR({ error: error.message }));
  }
}

export function* sortSaga({ payload = {} }) {
  const { column, order } = yield select(selectSortState);
  yield put(fetchDeploymentsPagination({ sort: column, order }));
}

export function* addFilterSaga() {
  const { column, order } = yield select(selectSortState);
  yield put(reset('deployments_table_filter'));
  yield put(fetchDeploymentsPagination({ sort: column, order }));
}

export function* removeFilterSaga() {
  const { column, order } = yield select(selectSortState);
  yield put(fetchDeploymentsPagination({ sort: column, order }));
}

export function* clearSearchSaga() {
  const { column, order } = yield select(selectSortState);
  yield put(reset('deployments_table_filter'));
  yield put(fetchDeploymentsPagination({ sort: column, order }));
}

export default [
  takeEvery(fetchDeploymentsPagination, fetchDeploymentsDataSaga),
  takeEvery(toggleSort, sortSaga),
  takeEvery(addFilter, addFilterSaga),
  takeEvery(removeFilter, removeFilterSaga),
  takeEvery(search, fetchDeploymentsDataSaga),
  takeEvery(clearSearch, clearSearchSaga),
];

import { takeLatest, call, put, select } from 'redux-saga/effects';
import { push, getLocation } from 'connected-react-router';
import paths from '../paths';
import {
  parseFiltersFromQS,
  stringifyFiltersForQS,
} from '../modules/lib/filter';
import {
  extractFromQuery,
  alterQuery,
  makeQueryString,
  parseQueryString,
 } from './lib/query';

import {
  initAuditPage,
  fetchAudit,
  fetchAuditPagination,
  FETCH_AUDIT_REQUEST,
  FETCH_AUDIT_SUCCESS,
  FETCH_AUDIT_ERROR,
  addFilter,
  removeFilter,
  setPagination,
  setFilters,
  selectPaginationState,
  selectTableFilters,
} from '../modules/audit';

import { getAuditEntries } from '../lib/api';

const pageUrl = paths.audit.route;

export function* fetchAuditDataSaga({ payload = {} }) {
  const options = payload;
  const { page, limit } = yield select(selectPaginationState);
  const offset = (page - 1) * limit;
  const filters = yield select(selectTableFilters, true);
  yield put(FETCH_AUDIT_REQUEST());
  try {
    const data = yield call(getAuditEntries, { offset, limit, filters });
    yield put(FETCH_AUDIT_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_AUDIT_ERROR({ error: error.message }));
  }
}

export function* addFilterSaga() {
  const location = yield select(getLocation);
  const filters = yield select(selectTableFilters);
  yield put(push(`${pageUrl}?${alterQuery(location.search, {
    filters: stringifyFiltersForQS(filters),
    pagination: null,
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

export function* paginationSaga() {
  const location = yield select(getLocation);
  const pagination = yield select(selectPaginationState);
  yield put(push(`${pageUrl}?${alterQuery(location.search, { pagination: makeQueryString({ ...pagination }) })}`));
}

export function* locationChangeSaga({ payload = {} }) {
  const { location } = payload;
  if (!location) return;
  const filters = parseFiltersFromQS(extractFromQuery(location.search, 'filters') || '');
  const pagination = parseQueryString(extractFromQuery(location.search, 'pagination') || '');
  yield put(setFilters(filters));
  yield put(setPagination(pagination));
  yield put(fetchAudit());
}


export default [
  takeLatest(fetchAudit, fetchAuditDataSaga),
  takeLatest(addFilter, addFilterSaga),
  takeLatest(removeFilter, removeFilterSaga),
  takeLatest(fetchAuditPagination, paginationSaga),
  takeLatest(initAuditPage, locationChangeSaga),
];

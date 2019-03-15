import { takeLatest, call, put, select } from 'redux-saga/effects';
import { push, getLocation } from 'connected-react-router';
import paths from '../paths';
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
  setPagination,
  selectPaginationState,

} from '../modules/audit';

import { getAuditEntries } from '../lib/api';

const pageUrl = paths.audit.route;

export function* fetchAuditDataSaga({ payload = {} }) {
  const options = payload;
  const { page, limit } = yield select(selectPaginationState);
  const offset = (page - 1) * limit;

  yield put(FETCH_AUDIT_REQUEST());
  try {
    const data = yield call(getAuditEntries, { offset, limit });
    yield put(FETCH_AUDIT_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_AUDIT_ERROR({ error: error.message }));
  }
}

export function* paginationSaga() {
  const location = yield select(getLocation);
  const pagination = yield select(selectPaginationState);
  yield put(push(`${pageUrl}?${alterQuery(location.search, { pagination: makeQueryString({ ...pagination }) })}`));
}

export function* locationChangeSaga({ payload = {} }) {
  const { location } = payload;
  if (!location) return;

  const pagination = parseQueryString(extractFromQuery(location.search, 'pagination') || '');
  yield put(setPagination(pagination));
  yield put(fetchAudit());
}


export default [
  takeLatest(fetchAudit, fetchAuditDataSaga),
  takeLatest(fetchAuditPagination, paginationSaga),
  takeLatest(initAuditPage, locationChangeSaga),
];

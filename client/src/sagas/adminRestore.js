import { takeLatest, call, put, select } from 'redux-saga/effects';
import { push, getLocation } from 'connected-react-router';
import { change } from 'redux-form';
import {
  extractFromQuery,
  alterQuery,
  makeQueryString,
  parseQueryString,
} from './lib/query';

import {
  initAdminRestorePage,
  fetchDeletedPagination,
  fetchDeleted,
  setPagination,
  changeType,
  restore,
  FETCH_DELETED_REQUEST,
  FETCH_DELETED_SUCCESS,
  FETCH_DELETED_ERROR,
  getFormValues,
  selectPaginationState,
} from '../modules/adminRestore';

import {
  getDeleted,
  restoreDeleted,
} from '../lib/api';

export function* fetchDeletedSaga({ payload = {} }) {
  const options = payload;
  const { page, limit } = yield select(selectPaginationState);
  const offset = (page - 1) * limit;

  try {
    const values = (yield select(getFormValues)) || {};
    if (!values.type) return;
    yield put(FETCH_DELETED_REQUEST());
    const data = yield call(getDeleted, { type: values.type, offset, limit });
    yield put(FETCH_DELETED_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_DELETED_ERROR({ error: error.message }));
  }
}

export function* paginationSaga() {
  const location = yield select(getLocation);
  const pagination = yield select(selectPaginationState);

  yield put(push(`${location.pathname}?${alterQuery(location.search, {
    pagination: makeQueryString({ ...pagination }),
  })}`));
}

export function* changeTypeSaga() {
  const location = yield select(getLocation);
  const values = (yield select(getFormValues)) || {};
  const { type = '' } = values;

  yield put(push(`${location.pathname}?${alterQuery(location.search, {
    type,
    pagination: null,
  })}`));
}

export function* restoreSaga({ payload }) {
  try {
    if (!payload) return;
    const values = (yield select(getFormValues)) || {};
    const { type = '' } = values;
    if (!type) return;

    yield call(restoreDeleted, { type, id: payload });
    yield put(fetchDeleted());
  } catch(error) {
    console.error(error); // eslint-disable-line no-console
  }
}

export function* locationChangeSaga({ payload = {} }) {
  const { match, location } = payload;
  if (!match || !location) return;

  const values = (yield select(getFormValues)) || {};
  const { type: formType = '' } = values;
  const type = extractFromQuery(location.search, 'type') || '';
  if (formType !== type) {
    yield put(change('adminRestore', 'type', type));
  }

  const pagination = parseQueryString(extractFromQuery(location.search, 'pagination') || '');
  yield put(setPagination(pagination));

  yield put(fetchDeleted());
}

export default [
  takeLatest(initAdminRestorePage, locationChangeSaga),
  takeLatest(fetchDeletedPagination, paginationSaga),
  takeLatest(fetchDeleted, fetchDeletedSaga),
  takeLatest(changeType, changeTypeSaga),
  takeLatest(restore, restoreSaga),
];

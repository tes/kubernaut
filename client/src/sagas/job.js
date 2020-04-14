import { takeLatest, call, put, take, select } from 'redux-saga/effects';
import { push, getLocation } from 'connected-react-router';
import {
  extractFromQuery,
  alterQuery,
  makeQueryString,
  parseQueryString,
} from './lib/query';

import {
  initialiseJobPage,
  fetchJobPageData,
  fetchVersions,
  fetchVersionsPagination,
  FETCH_JOB_REQUEST,
  FETCH_JOB_SUCCESS,
  FETCH_JOB_ERROR,
  FETCH_JOB_VERSIONS_REQUEST,
  FETCH_JOB_VERSIONS_SUCCESS,
  FETCH_JOB_VERSIONS_ERROR,
  setCanEdit,
  setPagination,
  selectJob,
  selectPaginationState,
} from '../modules/job';
import {
  getJob,
  getJobVersions,
  hasPermissionOn,
} from '../lib/api';

export function* fetchJobInfoSaga({ payload: { id, ...options } }) {
  yield put(FETCH_JOB_REQUEST());
  try {
    const data = yield call(getJob, id);
    yield put(FETCH_JOB_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_JOB_ERROR({ error: error.message }));
  }
}

export function* checkPermissionSaga({ payload: { data, ...options } }) {
  const { id } = data;
  try {
    const canEdit = yield call(hasPermissionOn, 'teams-manage', 'team', id);
    yield put(setCanEdit(canEdit.answer));
  } catch(error) {
    console.error(error); // eslint-disable-line no-console
  }
}

export function* paginationSaga() {
  const location = yield select(getLocation);
  const pagination = yield select(selectPaginationState);

  yield put(push(`${location.pathname}?${alterQuery(location.search, {
    pagination: makeQueryString({ ...pagination }),
  })}`));
}

export function* locationChangeSaga({ payload = {} }) {
  const { match, location } = payload;
  if (!match || !location) return;

  const jobKnownInState = yield select(selectJob);
  if (match.params.id !== jobKnownInState.id) {
    yield put(fetchJobPageData({ id: match.params.id }));
    yield take(FETCH_JOB_SUCCESS);
  }

  const pagination = parseQueryString(extractFromQuery(location.search, 'pagination') || '');
  yield put(setPagination(pagination));

  yield put(fetchVersions());
}

export function* fetchVersionsForJobSaga({ payload = {} }) {
  const options = payload;
  const { page, limit } = yield select(selectPaginationState);
  const offset = (page - 1) * limit;

  try {
    const { id } = yield select(selectJob);
    if (!id) return;
    yield put(FETCH_JOB_VERSIONS_REQUEST());
    const data = yield call(getJobVersions, { id, offset, limit });
    yield put(FETCH_JOB_VERSIONS_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_JOB_VERSIONS_ERROR({ error: error.message }));
  }
}

export default [
  takeLatest(fetchJobPageData, fetchJobInfoSaga),
  takeLatest(FETCH_JOB_SUCCESS, checkPermissionSaga),
  takeLatest(initialiseJobPage, locationChangeSaga),
  takeLatest(fetchVersions, fetchVersionsForJobSaga),
  takeLatest(fetchVersionsPagination, paginationSaga),
];

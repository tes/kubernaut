import { takeLatest, call, put, select } from 'redux-saga/effects';
import { get as _get } from 'lodash';
import {
  initialiseJobVersionPage,
  FETCH_JOB_VERSION_REQUEST,
  FETCH_JOB_VERSION_SUCCESS,
  FETCH_JOB_VERSION_ERROR,
  apply,
  selectJobVersion,
  setLogOutput,
  setLogOutputError,
  setCanApply,
} from '../modules/jobVersion';
import {
  getJobVersion,
  applyJobVersion,
  hasPermissionOn,
} from '../lib/api';

export function* fetchJobVersionSaga({ payload: { match, ...options } }) {
  if (!match) return;
  const { id } = match.params;
  yield put(FETCH_JOB_VERSION_REQUEST());
  try {
    const data = yield call(getJobVersion, id);
    yield put(FETCH_JOB_VERSION_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_JOB_VERSION_ERROR({ error: error.message }));
  }
}

export function* applySaga() {
  try {
    const jobVersion = yield select(selectJobVersion);
    const result = yield call(applyJobVersion, jobVersion);
    yield put(setLogOutput(result));
  } catch(error) {
    console.error(error); // eslint-disable-line no-console
    yield put(setLogOutputError(error.message || error));
  }
}

export function* checkPermissionSaga({ payload: { data, ...options } }) {
  try {
    const namespaceId = _get(data, 'job.namespace.id', '');
    const canApply = yield call(hasPermissionOn, 'jobs-apply', 'namespace', namespaceId);

    yield put(setCanApply(canApply.answer));
  } catch(error) {
    console.error(error); // eslint-disable-line no-console
  }
}

export default [
  takeLatest(initialiseJobVersionPage, fetchJobVersionSaga),
  takeLatest(FETCH_JOB_VERSION_SUCCESS, checkPermissionSaga),
  takeLatest(apply, applySaga),
];

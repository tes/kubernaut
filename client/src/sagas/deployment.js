import {
  takeLatest,
  call,
  put,
  take,
  fork,
  cancel,
  delay,
} from 'redux-saga/effects';
import { LOCATION_CHANGE } from 'connected-react-router';

import {
  fetchDeployment,
  FETCH_DEPLOYMENT_REQUEST,
  FETCH_DEPLOYMENT_SUCCESS,
  FETCH_DEPLOYMENT_ERROR,
  submitNoteForm,
  closeModal,
  setCanEdit,
  startPollLog,
  stopPollLog,
  updateDeploymentStatus,
} from '../modules/deployment';

import { getDeployment, updateDeploymentNote, hasPermissionOn } from '../lib/api';

export function* checkPermissionSaga({ payload = { } }) {
  const { namespace } = payload.data;
  if (!namespace) return;
  try {
    const hasPermission = yield call(hasPermissionOn, 'deployments-write', 'namespace', namespace.id);
    yield put(setCanEdit(hasPermission.answer));
  } catch(error) {
    console.error(error); // eslint-disable-line no-console
  }
}

export function* fetchDeploymentSaga({ payload = {} }) {
  const { match, ...options } = payload;
  if (!match) return;
  const id = match.params.deploymentId;
  if(!id) return;

  yield put(FETCH_DEPLOYMENT_REQUEST());
  try {
    const data = yield call(getDeployment, id);
    yield put(FETCH_DEPLOYMENT_SUCCESS({ data }));
    if (data.applyExitCode === null || data.rolloutStatusExitCode === null || data.status === 'pending') {
      yield put(startPollLog({ id }));
    }
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_DEPLOYMENT_ERROR({ error: error.message }));
  }
}

export function* submitDeploymentNoteSaga({ payload = {} }) {
  const { id, note = '', ...options } = payload;
  try {
    const updatedDeployment = yield call(updateDeploymentNote, id, note);
    yield put(submitNoteForm.success());
    yield put(FETCH_DEPLOYMENT_SUCCESS({ data: updatedDeployment }));
    yield put(closeModal());
  } catch (error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(submitNoteForm.failure(error));
  }
}

export function* pollLogSaga(id) {
  while(true) {
    const data = yield call(getDeployment, id);
    const {
      status,
      applyExitCode,
      rolloutStatusExitCode,
      log,
    } = data;

    yield put(updateDeploymentStatus({
      status,
      applyExitCode,
      rolloutStatusExitCode,
      log,
    }));
    if (applyExitCode === null || rolloutStatusExitCode === null || status === 'pending') {
      yield put(stopPollLog());
    }
    yield delay(3000);
  }
}

export function* initPollLogSaga({ payload = {} }) {
  const { id } = payload;

  const poller = yield fork(pollLogSaga, id);

  yield take(stopPollLog);
  yield cancel(poller);
}

export function* stopPollingSaga() {
  yield put(stopPollLog());
}

export default [
  takeLatest(fetchDeployment, fetchDeploymentSaga),
  takeLatest(FETCH_DEPLOYMENT_SUCCESS, checkPermissionSaga),
  takeLatest(submitNoteForm.REQUEST, submitDeploymentNoteSaga),
  takeLatest(startPollLog, initPollLogSaga),
  takeLatest(LOCATION_CHANGE, stopPollingSaga),
];

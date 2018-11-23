import { takeLatest, call, put } from 'redux-saga/effects';

import {
  fetchDeployment,
  FETCH_DEPLOYMENT_REQUEST,
  FETCH_DEPLOYMENT_SUCCESS,
  FETCH_DEPLOYMENT_ERROR,
  submitNoteForm,
  closeModal,
  setCanEdit,
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

export default [
  takeLatest(fetchDeployment, fetchDeploymentSaga),
  takeLatest(FETCH_DEPLOYMENT_SUCCESS, checkPermissionSaga),
  takeLatest(submitNoteForm.REQUEST, submitDeploymentNoteSaga),
];

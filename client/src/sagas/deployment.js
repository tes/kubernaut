import { takeLatest, call, put } from 'redux-saga/effects';

import {
  fetchDeployment,
  FETCH_DEPLOYMENT_REQUEST,
  FETCH_DEPLOYMENT_SUCCESS,
  FETCH_DEPLOYMENT_ERROR,
  submitNoteForm,
  closeModal,
} from '../modules/deployment';

import { getDeployment, updateDeploymentNote } from '../lib/api';

export function* fetchDeploymentSaga({ payload = {} }) {
  const { id, ...options } = payload;

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
  takeLatest(submitNoteForm.REQUEST, submitDeploymentNoteSaga),
];

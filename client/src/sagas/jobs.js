import { takeLatest, call, put, select } from 'redux-saga/effects';
import { push } from 'connected-react-router';
import { SubmissionError } from 'redux-form';

import {
  initialiseJobsPage,
  fetchJobsPagination,
  FETCH_JOBS_REQUEST,
  FETCH_JOBS_SUCCESS,
  FETCH_JOBS_ERROR,
  getFormValues,
  setNamespaces,
  submitForm,
} from '../modules/jobs';

import {
  getJobs,
  withPermission,
  saveJob,
} from '../lib/api';

export function* checkPermissionSaga({ payload: options }) {
  try {
    const data = yield call(withPermission, 'jobs-write', 'namespace');
    yield put(setNamespaces({ data }));
  } catch(error) {
    console.error(error); // eslint-disable-line no-console
  }
}

export function* fetchJobsDataSaga({ payload = {} }) {
  const { page = 1, limit = 20, ...options } = payload;
  const offset = (page - 1) * limit;

  yield put(FETCH_JOBS_REQUEST());
  try {
    const data = yield call(getJobs, { offset, limit });
    yield put(FETCH_JOBS_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_JOBS_ERROR({ error: error.message }));
  }
}

export function* submitSaga() {
  try {
    const values = yield select(getFormValues);

    if (!values.name || !values.namespace) {
      yield put(submitForm.failure());
      return;
    }
    const data = yield call(saveJob, values.name, values.namespace);
    yield put(submitForm.success());
    yield put(push(`/jobs/${data.id}/new`));
  } catch (err) {
    console.error(err); // eslint-disable-line no-console
    yield put(submitForm.failure(new SubmissionError({ _error: err.message || 'Something bad and unknown happened.' })));
  }
}

export default [
  takeLatest(fetchJobsPagination, fetchJobsDataSaga),
  takeLatest(initialiseJobsPage, fetchJobsDataSaga),
  takeLatest(initialiseJobsPage, checkPermissionSaga),
  takeLatest(submitForm.REQUEST, submitSaga),
];

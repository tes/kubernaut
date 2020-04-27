import { takeLatest, call, put, select } from 'redux-saga/effects';
import { SubmissionError } from 'redux-form';
import { push } from 'connected-react-router';

import {
  fetchNamespacesPagination,
  FETCH_NAMESPACES_REQUEST,
  FETCH_NAMESPACES_SUCCESS,
  FETCH_NAMESPACES_ERROR,
  setCanWrite,
  setClusters,
  getFormValues,
  submitForm,
} from '../modules/namespaces';

import {
  getNamespaces,
  hasPermission,
  getClusters,
  saveNamespace,
} from '../lib/api';

export function* fetchNamespacesDataSaga({ payload = {} }) {
  const { page = 1, limit = 50, ...options } = payload;
  const offset = (page - 1) * limit;

  yield put(FETCH_NAMESPACES_REQUEST());
  try {
    const data = yield call(getNamespaces, { offset, limit });
    yield put(FETCH_NAMESPACES_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_NAMESPACES_ERROR({ error: error.message }));
  }
}

export function* checkPermissionSaga() {
  try {
    const canWrite = yield call(hasPermission, 'namespaces-write');
    yield put(setCanWrite(canWrite.answer));
    if (canWrite.answer) {
      const clusters = yield call(getClusters);
      yield put(setClusters({ data: clusters }));
    }
  } catch(error) {
    console.error(error); // eslint-disable-line no-console
  }
}

export function* submitSaga() {
  try {
    const values = yield select(getFormValues);

    if (!values.name || !values.cluster || !values.context) {
      yield put(submitForm.failure());
      return;
    }
    const data = yield call(saveNamespace, values.name, values.cluster, values.context);
    yield put(submitForm.success());
    yield put(push(`/namespaces/${data.id}`));
  } catch (err) {
    console.error(err); // eslint-disable-line no-console
    yield put(submitForm.failure(new SubmissionError({ _error: err.message || 'Something bad and unknown happened.' })));
  }
}

export default [
  takeLatest(fetchNamespacesPagination, fetchNamespacesDataSaga),
  takeLatest(fetchNamespacesPagination, checkPermissionSaga),
  takeLatest(submitForm.REQUEST, submitSaga),
];

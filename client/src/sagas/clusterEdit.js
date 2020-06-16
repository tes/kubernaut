import { takeEvery, call, put, select } from 'redux-saga/effects';
import { SubmissionError } from 'redux-form';
import { push } from 'connected-react-router';

import {
  initClusterEditPage,
  submitForm,
  FETCH_CLUSTER_REQUEST,
  FETCH_CLUSTER_SUCCESS,
  FETCH_CLUSTER_ERROR,
  selectCluster,
} from '../modules/clusterEdit';
import { getCluster, editCluster } from '../lib/api';


export function* fetchClusterSaga({ payload: { match, ...options } }) {
  if (!match) return;
  const { clusterId } = match.params;
  yield put(FETCH_CLUSTER_REQUEST());
  try {
    const data = yield call(getCluster, clusterId);
    yield put(FETCH_CLUSTER_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_CLUSTER_ERROR({ error: error.message }));
  }
}

export function* editClusterSaga({ payload: formValues }, options = {}) {
  const { id } = yield select(selectCluster);
  const data = formValues;

  try {
    yield call(editCluster, id, data, options);
  } catch(err) {
    if (!options.quiet) console.error(err); // eslint-disable-line no-console
    return yield put(submitForm.failure(new SubmissionError({ _error: err.message || 'Something bad and unknown happened.' })));
  }
  yield put(submitForm.success());
  yield put(push('/admin/clusters'));
}

export default [
  takeEvery(initClusterEditPage, fetchClusterSaga),
  takeEvery(submitForm.REQUEST, editClusterSaga),
];

import { takeLatest, call, put, select } from 'redux-saga/effects';
import { SubmissionError } from 'redux-form';
import { push, getLocation } from 'connected-react-router';

import {
  extractFromQuery,
  alterQuery,
  makeQueryString,
  parseQueryString,
} from './lib/query';
import {
  initialiseClustersPage,
  fetchClusters,
  fetchClustersPagination,
  FETCH_CLUSTERS_REQUEST,
  FETCH_CLUSTERS_SUCCESS,
  FETCH_CLUSTERS_ERROR,
  getFormValues,
  submitForm,
  selectPaginationState,
  setPagination,
  closeModal,
} from '../modules/clusters';

import {
  getClusters,
  saveCluster,
} from '../lib/api';

const pageUrl = '/admin/clusters';

export function* fetchClustersDataSaga({ payload = {} }) {
  const options = payload;
  const { page, limit } = yield select(selectPaginationState);
  const offset = (page - 1) * limit;

  yield put(FETCH_CLUSTERS_REQUEST());
  try {
    const data = yield call(getClusters, { offset, limit });
    yield put(FETCH_CLUSTERS_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_CLUSTERS_ERROR({ error: error.message }));
  }
}

export function* submitSaga() {
  try {
    const values = yield select(getFormValues);

    if (!values.name || !values.config) {
      yield put(submitForm.failure());
      return;
    }
    yield call(saveCluster, values);
    yield put(submitForm.success());
    yield put(closeModal());
    yield put(fetchClusters());
  } catch (err) {
    console.error(err); // eslint-disable-line no-console
    yield put(submitForm.failure(new SubmissionError({ _error: err.message || 'Something bad and unknown happened.' })));
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
  yield put(fetchClusters());
}

export default [
  takeLatest(fetchClusters, fetchClustersDataSaga),
  takeLatest(initialiseClustersPage, locationChangeSaga),
  takeLatest(fetchClustersPagination, paginationSaga),
  takeLatest(submitForm.REQUEST, submitSaga),
];

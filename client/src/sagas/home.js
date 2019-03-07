import { takeLatest, call, put } from 'redux-saga/effects';
import {
  initHomePage,
  FETCH_RELEASES_REQUEST,
  FETCH_RELEASES_SUCCESS,
  FETCH_RELEASES_ERROR,
  FETCH_DEPLOYMENTS_REQUEST,
  FETCH_DEPLOYMENTS_SUCCESS,
  FETCH_DEPLOYMENTS_ERROR,
} from '../modules/home';

import {
  getReleases,
  getDeployments,
} from '../lib/api';

export function* fetchReleasesDataSaga({ payload = {} }) {
  yield put(FETCH_RELEASES_REQUEST());
  try {
    const data = yield call(getReleases, { offset: 0, limit: 15, sort: 'created', order: 'desc' });
    yield put(FETCH_RELEASES_SUCCESS({ data }));
  } catch(error) {
    if (!payload.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_RELEASES_ERROR({ error: error.message }));
  }
}

export function* fetchDeploymentsDataSaga({ payload = {} }) {
  yield put(FETCH_DEPLOYMENTS_REQUEST());
  try {
    const data = yield call(getDeployments, { offset: 0, limit: 15, sort: 'created', order: 'desc' });
    yield put(FETCH_DEPLOYMENTS_SUCCESS({ data }));
  } catch(error) {
    if (!payload.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_DEPLOYMENTS_ERROR({ error: error.message }));
  }
}

export default [
  takeLatest(initHomePage, fetchDeploymentsDataSaga),
  takeLatest(initHomePage, fetchReleasesDataSaga),
];

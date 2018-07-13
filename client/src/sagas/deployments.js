import { takeEvery, call, put } from 'redux-saga/effects';

import {
  fetchDeploymentsPagination,
  FETCH_DEPLOYMENTS_REQUEST,
  FETCH_DEPLOYMENTS_SUCCESS,
  FETCH_DEPLOYMENTS_ERROR,
} from '../modules/deployments';

import { getDeployments } from '../lib/api';

export function* fetchDeploymentsDataSaga({ payload = {} }) {
  const { page = 1, limit = 50, ...options } = payload;
  const offset = (page - 1) * limit;

  yield put(FETCH_DEPLOYMENTS_REQUEST());
  try {
    const data = yield call(getDeployments, { offset, limit });
    yield put(FETCH_DEPLOYMENTS_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_DEPLOYMENTS_ERROR({ error: error.message }));
  }
}

export default [
  takeEvery(fetchDeploymentsPagination, fetchDeploymentsDataSaga),
];

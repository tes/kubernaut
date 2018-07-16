import { takeEvery, call, put } from 'redux-saga/effects';

import {
  fetchDeployment,
  FETCH_DEPLOYMENT_REQUEST,
  FETCH_DEPLOYMENT_SUCCESS,
  FETCH_DEPLOYMENT_ERROR,
} from '../modules/deployment';

import { getDeployment } from '../lib/api';

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

export default [
  takeEvery(fetchDeployment, fetchDeploymentSaga),
];

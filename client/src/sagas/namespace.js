import { takeEvery, call, put } from 'redux-saga/effects';
import {
  fetchNamespacePageData,
  fetchDeploymentsPagination,
  FETCH_NAMESPACE_REQUEST,
  FETCH_NAMESPACE_SUCCESS,
  FETCH_NAMESPACE_ERROR,
  FETCH_DEPLOYMENTS_REQUEST,
  FETCH_DEPLOYMENTS_SUCCESS,
  FETCH_DEPLOYMENTS_ERROR,
} from '../modules/namespace';
import { getNamespace, fetchDeployments } from '../lib/api';

export function* fetchNamespaceInfoSaga({ payload: { id, ...options } }) {
  yield put(FETCH_NAMESPACE_REQUEST());
  try {
    const data = yield call(getNamespace, id);
    yield put(FETCH_NAMESPACE_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_NAMESPACE_ERROR({ error: error.message }));
  }
}

export function* fetchDeploymentsForNamespaceSaga({ payload }) {
  const { id, page, limit, ...options } = payload;
  const offset = (page - 1) * limit;
  yield put(FETCH_DEPLOYMENTS_REQUEST());
  try {
    const data = yield call(fetchDeployments, { namespace: id, offset, limit });
    yield put(FETCH_DEPLOYMENTS_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_DEPLOYMENTS_ERROR({ error: error.message }));
  }
}

export default [
  takeEvery(fetchNamespacePageData, fetchNamespaceInfoSaga),
  takeEvery(fetchNamespacePageData, fetchDeploymentsForNamespaceSaga),
  takeEvery(fetchDeploymentsPagination, fetchDeploymentsForNamespaceSaga),
];

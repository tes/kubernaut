import { takeEvery, call, put, select } from 'redux-saga/effects';
import {
  fetchNamespacePageData,
  fetchDeploymentsPagination,
  toggleSort,
  FETCH_NAMESPACE_REQUEST,
  FETCH_NAMESPACE_SUCCESS,
  FETCH_NAMESPACE_ERROR,
  FETCH_DEPLOYMENTS_REQUEST,
  FETCH_DEPLOYMENTS_SUCCESS,
  FETCH_DEPLOYMENTS_ERROR,
  selectNamespace,
  selectSortState,
} from '../modules/namespace';
import { getNamespace, getDeployments } from '../lib/api';

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
  const {
    page = 1,
    limit = 20,
    sort = 'created',
    order = 'desc',
    ...options
  } = payload;
  const offset = (page - 1) * limit;

  try {
    const { name, cluster } = yield select(selectNamespace);
    yield put(FETCH_DEPLOYMENTS_REQUEST());
    const data = yield call(getDeployments, { namespace: name, cluster: cluster.name, offset, limit, sort, order });
    yield put(FETCH_DEPLOYMENTS_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_DEPLOYMENTS_ERROR({ error: error.message }));
  }
}

export function* sortDeploymentsSaga({ payload = {} }) {
  const { column, order } = yield select(selectSortState);
  yield put(fetchDeploymentsPagination({ sort: column, order }));
}

export default [
  takeEvery(fetchNamespacePageData, fetchNamespaceInfoSaga),
  takeEvery(FETCH_NAMESPACE_SUCCESS, fetchDeploymentsForNamespaceSaga),
  takeEvery(fetchDeploymentsPagination, fetchDeploymentsForNamespaceSaga),
  takeEvery(toggleSort, sortDeploymentsSaga),
];

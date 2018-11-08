import { takeEvery, call, put, select, take } from 'redux-saga/effects';
import { push, getLocation } from 'connected-react-router';
import {
  extractFromQuery,
  alterQuery,
  makeQueryString,
  parseQueryString,
 } from './lib/query';
 import {
  initialiseNamespacePage,
  fetchNamespacePageData,
  fetchDeployments,
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
  selectPaginationState,
  setPagination,
  setSort,
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
  const options = payload;
  const { page, limit } = yield select(selectPaginationState);
  const offset = (page - 1) * limit;
  const { column, order } = yield select(selectSortState);

  try {
    const { name, cluster } = yield select(selectNamespace);
    if (!name || !cluster) return;
    yield put(FETCH_DEPLOYMENTS_REQUEST());
    const data = yield call(getDeployments, { namespace: name, cluster: cluster.name, offset, limit, sort: column, order });
    yield put(FETCH_DEPLOYMENTS_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_DEPLOYMENTS_ERROR({ error: error.message }));
  }
}

export function* sortDeploymentsSaga({ payload = {} }) {
  const location = yield select(getLocation);
  const sort = yield select(selectSortState);
  yield put(push(`${location.pathname}?${alterQuery(location.search, {
    sort: makeQueryString({ ...sort }),
    pagination: null,
  })}`));
}

export function* paginationSaga() {
  const location = yield select(getLocation);
  const pagination = yield select(selectPaginationState);
  yield put(push(`${location.pathname}?${alterQuery(location.search, { pagination: makeQueryString({ ...pagination }) })}`));
}

export function* locationChangeSaga({ payload = {} }) {
  const { match, location } = payload;
  if (!match || !location) return;

  const namespace = yield select(selectNamespace);
  if (!namespace.id || namespace.id !== match.params.namespaceId) {
    yield put(fetchNamespacePageData({ id: match.params.namespaceId }));
    yield take(FETCH_NAMESPACE_SUCCESS);
  }

  const pagination = parseQueryString(extractFromQuery(location.search, 'pagination') || '');
  const sort = parseQueryString(extractFromQuery(location.search, 'sort') || '');
  yield put(setPagination(pagination));
  yield put(setSort(sort));
  yield put(fetchDeployments());
}

export default [
  takeEvery(fetchNamespacePageData, fetchNamespaceInfoSaga),
  takeEvery(fetchDeployments, fetchDeploymentsForNamespaceSaga),
  takeEvery(fetchDeploymentsPagination, paginationSaga),
  takeEvery(toggleSort, sortDeploymentsSaga),
  takeEvery(initialiseNamespacePage, locationChangeSaga),
];

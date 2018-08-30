import { takeEvery, call, put } from 'redux-saga/effects';

import {
  initServiceDetailPage,
  fetchDeploymentsPagination,
  fetchReleasesPagination,
  FETCH_RELEASES_REQUEST,
  FETCH_RELEASES_SUCCESS,
  FETCH_RELEASES_ERROR,
  FETCH_DEPLOYMENTS_REQUEST,
  FETCH_DEPLOYMENTS_SUCCESS,
  FETCH_DEPLOYMENTS_ERROR,
  FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_REQUEST,
  FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_SUCCESS,
  FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_ERROR,
} from '../modules/service';

import {
  getReleases,
  getDeployments,
  getLatestDeploymentsByNamespaceForService,
} from '../lib/api';

export function* initServiceDetailPageSaga({ payload = {} }) {
  const { registry, service } = payload;
  if (!registry) throw new Error('provide a registry');
  if (!service) throw new Error('provide a service');

  yield put(fetchReleasesPagination(payload));
  yield put(fetchDeploymentsPagination(payload));
}

export function* fetchReleasesDataSaga({ payload = {} }) {
  const { page = 1, limit = 10, registry, service, ...options } = payload;
  if (!registry) throw new Error('provide a registry');
  if (!service) throw new Error('provide a service');
  const offset = (page - 1) * limit;

  yield put(FETCH_RELEASES_REQUEST());
  try {
    const data = yield call(getReleases, { registry, service, offset, limit });
    yield put(FETCH_RELEASES_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_RELEASES_ERROR({ error: error.message }));
  }
}

export function* fetchDeploymentsDataSaga({ payload = {} }) {
  const { page = 1, limit = 10, registry, service, ...options } = payload;
  if (!registry) throw new Error('provide a registry');
  if (!service) throw new Error('provide a service');
  const offset = (page - 1) * limit;

  yield put(FETCH_DEPLOYMENTS_REQUEST());
  try {
    const data = yield call(getDeployments, { registry, service, offset, limit });
    yield put(FETCH_DEPLOYMENTS_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_DEPLOYMENTS_ERROR({ error: error.message }));
  }
}

export function* fetchLatestDeploymentsByNamespaceForServiceSaga({ payload = {} }) {
  const { registry, service, ...options } = payload;
  if (!registry) throw new Error('provide a registry');
  if (!service) throw new Error('provide a service');

  const quiet = options.quiet;
  yield put(FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_REQUEST({ loading: true }));

  try {
    const data = yield call(getLatestDeploymentsByNamespaceForService, {
      registry,
      service,
    });
    yield put(FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_SUCCESS({ data }));
  } catch(error) {
    if (!quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_ERROR({ error: error.message }));
  }

}

export default [
  takeEvery(initServiceDetailPage, initServiceDetailPageSaga),
  takeEvery(fetchReleasesPagination, fetchReleasesDataSaga),
  takeEvery(fetchDeploymentsPagination, fetchDeploymentsDataSaga),
  takeEvery(fetchReleasesPagination, fetchLatestDeploymentsByNamespaceForServiceSaga),
];

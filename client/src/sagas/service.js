import { takeLatest, call, put } from 'redux-saga/effects';

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
  FETCH_HAS_DEPLOYMENT_NOTES_SUCCESS,
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
    const data = yield call(getReleases, { registry, service, offset, limit, sort: 'created', order: 'desc' });
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
    const data = yield call(getDeployments, { registry, service, offset, limit, sort: 'created', order: 'desc' });
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

export function* fetchHasDeploymentNotesSaga({ payload = {} }) {
  const { data: releases, ...options } = payload;
  if (!releases.count || !releases.items) return;

  try {
    const service = releases.items[0].service.name;
    const registry = releases.items[0].service.registry.name;
    const versions = releases.items.map(r => r.version);
    const exact = true;
    const filters = {
      registry: [{ value: registry, exact }],
      service: [{ value: service, exact }],
      version: [{ value: versions, exact }]
    };
    const data = yield call(getDeployments, { sort: 'created', order: 'desc', hasNotes: true, filters, limit: 50 });
    yield put(FETCH_HAS_DEPLOYMENT_NOTES_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
  }
}

export default [
  takeLatest(initServiceDetailPage, initServiceDetailPageSaga),
  takeLatest(fetchReleasesPagination, fetchReleasesDataSaga),
  takeLatest(fetchDeploymentsPagination, fetchDeploymentsDataSaga),
  takeLatest(fetchReleasesPagination, fetchLatestDeploymentsByNamespaceForServiceSaga),
  takeLatest(FETCH_RELEASES_SUCCESS, fetchHasDeploymentNotesSaga),
];

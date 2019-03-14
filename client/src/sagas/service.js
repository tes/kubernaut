import { takeLatest, call, put, select } from 'redux-saga/effects';
import { push, replace, getLocation } from 'connected-react-router';
import { isEqual as _isEqual } from 'lodash';
import {
  extractFromQuery,
  alterQuery,
  makeQueryString,
  parseQueryString,
 } from './lib/query';
import {
  initServiceDetailPage,
  fetchDeployments,
  fetchDeploymentsPagination,
  setDeploymentsPagination,
  fetchReleases,
  fetchReleasesPagination,
  setReleasesPagination,
  setCanManage,
  setCurrentService,
  clearCurrentService,
  selectCurrentService,
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
  selectReleasesPaginationState,
  selectDeploymentsPaginationState,
  releasesDefaultPagination,
  deploymentsDefaultPagination,
} from '../modules/service';

import {
  getReleases,
  getDeployments,
  getLatestDeploymentsByNamespaceForService,
  getCanManageAnyNamespace,
} from '../lib/api';

export function* initServiceDetailPageSaga({ payload = {} }) {
  const { match, location } = payload;
  if (!match || !location) return;
  const { registry, name: service } = match.params;
  if (!registry) throw new Error('provide a registry');
  if (!service) throw new Error('provide a service');

  const parsedReleasesPagination = parseQueryString(extractFromQuery(location.search, 'r-pagination') || '');
  const parsedDeploymentsPagination = parseQueryString(extractFromQuery(location.search, 'd-pagination') || '');

  if (_isEqual({}, parsedReleasesPagination)) {
    yield put(clearCurrentService());
    yield put(replace(`${location.pathname}?${alterQuery(location.search, {
      'r-pagination': makeQueryString({ ...releasesDefaultPagination }),
    })}`));
    return;
  }

  if (_isEqual({}, parsedDeploymentsPagination)) {
    yield put(clearCurrentService());
    yield put(replace(`${location.pathname}?${alterQuery(location.search, {
      'd-pagination': makeQueryString({ ...deploymentsDefaultPagination }),
    })}`));
    return;
  }

  const serviceKnownInState = yield select(selectCurrentService);
  const urlMatchesStateService = serviceKnownInState.registryName === registry && serviceKnownInState.name === service;
  const releasesPagination = yield select(selectReleasesPaginationState);
  if (!urlMatchesStateService || !_isEqual(releasesPagination, parsedReleasesPagination)) {
    yield put(setReleasesPagination(parsedReleasesPagination));
    yield put(fetchReleases({ registry, service }));
  }

  const deploymentsPagination = yield select(selectDeploymentsPaginationState);
  if (!urlMatchesStateService || !_isEqual(deploymentsPagination, parsedDeploymentsPagination)) {
    yield put(setDeploymentsPagination(parsedDeploymentsPagination));
    yield put(fetchDeployments({ registry, service }));
  }

  if (!urlMatchesStateService) yield put(setCurrentService({ registry, service }));
}

export function* fetchReleasesDataSaga({ payload = {} }) {
  const { registry, service, ...options } = payload;
  if (!registry) throw new Error('provide a registry');
  if (!service) throw new Error('provide a service');

  const { page, limit } = yield select(selectReleasesPaginationState);
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
  const { registry, service, ...options } = payload;
  if (!registry) throw new Error('provide a registry');
  if (!service) throw new Error('provide a service');

  const { page, limit } = yield select(selectDeploymentsPaginationState);
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

export function* paginationSaga() {
  const location = yield select(getLocation);
  const releasesPagination = yield select(selectReleasesPaginationState);
  const deploymentsPagination = yield select(selectDeploymentsPaginationState);
  yield put(push(`${location.pathname}?${alterQuery(location.search, {
    'r-pagination': makeQueryString({ ...releasesPagination }),
    'd-pagination': makeQueryString({ ...deploymentsPagination })
  })}`));
}

export function* canManageSaga() {
  try {
    const canManage = yield call(getCanManageAnyNamespace);
    yield put(setCanManage(canManage.answer));
  } catch(error) {
    console.error(error); // eslint-disable-line no-console
  }
}

export default [
  takeLatest(initServiceDetailPage, initServiceDetailPageSaga),
  takeLatest(initServiceDetailPage, canManageSaga),
  takeLatest(fetchReleasesPagination, paginationSaga),
  takeLatest(fetchReleases, fetchReleasesDataSaga),
  takeLatest(fetchDeploymentsPagination, paginationSaga),
  takeLatest(fetchDeployments, fetchDeploymentsDataSaga),
  takeLatest(fetchReleases, fetchLatestDeploymentsByNamespaceForServiceSaga),
  takeLatest(FETCH_RELEASES_SUCCESS, fetchHasDeploymentNotesSaga),
];

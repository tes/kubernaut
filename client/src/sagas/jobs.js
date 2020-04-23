import { takeLatest, call, put, select } from 'redux-saga/effects';
import { push, getLocation } from 'connected-react-router';
import { SubmissionError, reset } from 'redux-form';
import {
  parseFiltersFromQS,
  parseSearchFromQS,
  stringifyFiltersForQS,
  stringifySearchForQS,
} from '../modules/lib/filter';
import {
  extractFromQuery,
  alterQuery,
  makeQueryString,
  parseQueryString,
} from './lib/query';
import {
  initialiseJobsPage,
  fetchJobs,
  fetchJobsPagination,
  FETCH_JOBS_REQUEST,
  FETCH_JOBS_SUCCESS,
  FETCH_JOBS_ERROR,
  getFormValues,
  setNamespaces,
  setRegistries,
  submitForm,
  selectTableFilters,
  selectSearchFilter,
  selectPaginationState,
  addFilter,
  removeFilter,
  search,
  clearSearch,
  setFilters,
  setSearch,
  setPagination,
} from '../modules/jobs';

import {
  getJobs,
  withPermission,
  saveJob,
} from '../lib/api';

const pageUrl = '/jobs';


export function* checkPermissionSaga({ payload: options }) {
  try {
    const namespaces = yield call(withPermission, 'jobs-write', 'namespace');
    yield put(setNamespaces({ data: namespaces }));
    const registries = yield call(withPermission, 'jobs-write', 'registry');
    yield put(setRegistries({ data: registries }));
  } catch(error) {
    console.error(error); // eslint-disable-line no-console
  }
}

export function* addFilterSaga() {
  yield put(reset('jobs_table_filter'));
  const location = yield select(getLocation);
  const filters = yield select(selectTableFilters);
  yield put(push(`${pageUrl}?${alterQuery(location.search, {
    filters: stringifyFiltersForQS(filters),
    pagination: null,
    search: null,
  })}`));
}

export function* removeFilterSaga() {
  const location = yield select(getLocation);
  const filters = yield select(selectTableFilters);
  yield put(push(`${pageUrl}?${alterQuery(location.search, {
    filters: stringifyFiltersForQS(filters),
    pagination: null,
  })}`));
}

export function* searchSaga() {
  const location = yield select(getLocation);
  const searchFilter = yield select(selectSearchFilter);
  yield put(push(`${pageUrl}?${alterQuery(location.search, {
    search: stringifySearchForQS(searchFilter),
    pagination: null,
  })}`));
}

export function* paginationSaga() {
  const location = yield select(getLocation);
  const pagination = yield select(selectPaginationState);
  yield put(push(`${pageUrl}?${alterQuery(location.search, { pagination: makeQueryString({ ...pagination }) })}`));
}

export function* fetchJobsDataSaga({ payload = {} }) {
  const options = payload;
  const { page, limit } = yield select(selectPaginationState);
  const offset = (page - 1) * limit;
  const filters = yield select(selectTableFilters, true);

  yield put(FETCH_JOBS_REQUEST());
  try {
    const data = yield call(getJobs, { offset, limit, filters });
    yield put(FETCH_JOBS_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_JOBS_ERROR({ error: error.message }));
  }
}

export function* submitSaga() {
  try {
    const values = yield select(getFormValues);

    if (!values.name || !values.namespace || !values.registry) {
      yield put(submitForm.failure());
      return;
    }
    const data = yield call(saveJob, values.name, values.namespace, values.registry);
    yield put(submitForm.success());
    yield put(push(`/jobs/${data.id}/new`));
  } catch (err) {
    console.error(err); // eslint-disable-line no-console
    yield put(submitForm.failure(new SubmissionError({ _error: err.message || 'Something bad and unknown happened.' })));
  }
}

export function* locationChangeSaga({ payload = {} }) {
  const { location } = payload;
  if (!location) return;

  const filters = parseFiltersFromQS(extractFromQuery(location.search, 'filters') || '');
  const search = parseSearchFromQS(extractFromQuery(location.search, 'search') || '');
  const pagination = parseQueryString(extractFromQuery(location.search, 'pagination') || '');
  yield put(setFilters(filters));
  yield put(setSearch(search));
  yield put(setPagination(pagination));
  yield put(fetchJobs());
}

export default [
  takeLatest(fetchJobs, fetchJobsDataSaga),
  takeLatest(fetchJobsPagination, paginationSaga),
  takeLatest(initialiseJobsPage, locationChangeSaga),
  takeLatest(initialiseJobsPage, checkPermissionSaga),
  takeLatest(submitForm.REQUEST, submitSaga),
  takeLatest(addFilter, addFilterSaga),
  takeLatest(removeFilter, removeFilterSaga),
  takeLatest(search, searchSaga),
  takeLatest(clearSearch, searchSaga),
];

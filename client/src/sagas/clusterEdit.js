import { takeLatest, call, put, select } from 'redux-saga/effects';
import { SubmissionError } from 'redux-form';
import { push } from 'connected-react-router';

import {
  initClusterEditPage,
  submitForm,
  submitNewHostForm,
  submitNewVariableForm,
  updateHostsForm,
  updateVariablesForm,
  FETCH_CLUSTER_REQUEST,
  FETCH_CLUSTER_SUCCESS,
  FETCH_CLUSTER_ERROR,
  FETCH_INGRESS_HOSTS_REQUEST,
  FETCH_INGRESS_HOSTS_SUCCESS,
  FETCH_INGRESS_HOSTS_ERROR,
  FETCH_INGRESS_VARIABLES_REQUEST,
  FETCH_INGRESS_VARIABLES_SUCCESS,
  FETCH_INGRESS_VARIABLES_ERROR,
  FETCH_CLUSTER_INGRESS_HOSTS_REQUEST,
  FETCH_CLUSTER_INGRESS_HOSTS_SUCCESS,
  FETCH_CLUSTER_INGRESS_HOSTS_ERROR,
  FETCH_CLUSTER_INGRESS_VARIABLES_REQUEST,
  FETCH_CLUSTER_INGRESS_VARIABLES_SUCCESS,
  FETCH_CLUSTER_INGRESS_VARIABLES_ERROR,
  selectCluster,
} from '../modules/clusterEdit';
import {
  getCluster,
  editCluster,
  getIngressHosts,
  getIngressVariables,
  getClusterIngressHosts,
  getClusterIngressVariables,
  saveClusterIngressHost,
  saveClusterIngressVariable,
  updateClusterIngressHost,
  updateClusterIngressVariable,
} from '../lib/api';


export function* fetchClusterSaga({ payload: { match, ...options } }) {
  if (!match) return;
  const { clusterId } = match.params;
  yield put(FETCH_CLUSTER_REQUEST());
  try {
    const data = yield call(getCluster, clusterId);
    yield put(FETCH_CLUSTER_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_CLUSTER_ERROR({ error: error.message }));
  }
}

export function* fetchIngressHostsSaga({ payload: { match, ...options } }) {
  yield put(FETCH_INGRESS_HOSTS_REQUEST());
  try {
    const data = yield call(getIngressHosts);
    yield put(FETCH_INGRESS_HOSTS_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_INGRESS_HOSTS_ERROR({ error: error.message }));
  }
}

export function* fetchClusterIngressHostsSaga({ payload: { match, ...options } }) {
  if (!match) return;
  const { clusterId } = match.params;
  yield put(FETCH_CLUSTER_INGRESS_HOSTS_REQUEST());
  try {
    const data = yield call(getClusterIngressHosts, clusterId);
    yield put(FETCH_CLUSTER_INGRESS_HOSTS_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_CLUSTER_INGRESS_HOSTS_ERROR({ error: error.message }));
  }
}

export function* fetchIngressVariablesSaga({ payload: { match, ...options } }) {
  yield put(FETCH_INGRESS_VARIABLES_REQUEST());
  try {
    const data = yield call(getIngressVariables);
    yield put(FETCH_INGRESS_VARIABLES_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_INGRESS_VARIABLES_ERROR({ error: error.message }));
  }
}


export function* fetchClusterIngressVariablesSaga({ payload: { match, ...options } }) {
  if (!match) return;
  const { clusterId } = match.params;
  yield put(FETCH_CLUSTER_INGRESS_VARIABLES_REQUEST());
  try {
    const data = yield call(getClusterIngressVariables, clusterId);
    yield put(FETCH_CLUSTER_INGRESS_VARIABLES_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_CLUSTER_INGRESS_VARIABLES_ERROR({ error: error.message }));
  }
}

export function* editClusterSaga({ payload: formValues }, options = {}) {
  const { id } = yield select(selectCluster);
  const { cluster: data } = formValues;

  try {
    yield call(editCluster, id, data, options);
  } catch(err) {
    if (!options.quiet) console.error(err); // eslint-disable-line no-console
    return yield put(submitForm.failure(new SubmissionError({ _error: err.message || 'Something bad and unknown happened.' })));
  }
  yield put(submitForm.success());
  yield put(push('/admin/clusters'));
}

export function* addClusterIngressHostSaga({ payload: formValues }, options = {}) {
  const { newIngressHostValue: data } = formValues;
  try {
    if (!data.ingressHostKey || !data.value) return submitNewHostForm.success();
    const { id } = yield select(selectCluster);
    yield call(saveClusterIngressHost, id, {
      value: data.value,
      ingressHostKeyId: data.ingressHostKey,
    });

    yield call(fetchClusterIngressHostsSaga, { payload: { match: { params: { clusterId: id } } } });
    yield put(submitNewHostForm.success());

  } catch(err) {
    if (!options.quiet) console.error(err); // eslint-disable-line no-console
    return yield put(submitNewHostForm.failure(new SubmissionError({ _error: err.message || 'Something bad and unknown happened.' })));
  }
}

export function* addClusterIngressVariableSaga({ payload: formValues }, options = {}) {
  const { newIngressVariableValue: data } = formValues;
  try {
    if (!data.ingressVariableKey || !data.value) return submitNewVariableForm.success();
    const { id } = yield select(selectCluster);
    yield call(saveClusterIngressVariable, id, {
      value: data.value,
      ingressVariableKeyId: data.ingressVariableKey,
    });

    yield call(fetchClusterIngressVariablesSaga, { payload: { match: { params: { clusterId: id } } } });
    yield put(submitNewVariableForm.success());

  } catch(err) {
    if (!options.quiet) console.error(err); // eslint-disable-line no-console
    return yield put(submitNewVariableForm.failure(new SubmissionError({ _error: err.message || 'Something bad and unknown happened.' })));
  }
}

export function* updateClusterIngressHostsSaga({ payload: formValues }, options = {}) {
  const { clusterIngressHosts: data } = formValues;
  try {

    if (!data.hosts) return updateHostsForm.success();

    for (const ingressHost of data.hosts) {
      const { id, value } = ingressHost;
      yield call(updateClusterIngressHost, id, value);
    }
    yield put(updateHostsForm.success());
  } catch(err) {
    if (!options.quiet) console.error(err); // eslint-disable-line no-console
    return yield put(updateHostsForm.failure(new SubmissionError({ _error: err.message || 'Something bad and unknown happened.' })));
  }
}

export function* updateClusterIngressVariablesSaga({ payload: formValues }, options = {}) {
  const { clusterIngressVariables: data } = formValues;
  try {

    if (!data.variables) return updateVariablesForm.success();

    for (const ingressVariable of data.variables) {
      const { id, value } = ingressVariable;
      yield call(updateClusterIngressVariable, id, value);
    }
    yield put(updateVariablesForm.success());
  } catch(err) {
    if (!options.quiet) console.error(err); // eslint-disable-line no-console
    return yield put(updateVariablesForm.failure(new SubmissionError({ _error: err.message || 'Something bad and unknown happened.' })));
  }
}

export default [
  takeLatest(initClusterEditPage, fetchClusterSaga),
  takeLatest(initClusterEditPage, fetchIngressHostsSaga),
  takeLatest(initClusterEditPage, fetchIngressVariablesSaga),
  takeLatest(initClusterEditPage, fetchClusterIngressHostsSaga),
  takeLatest(initClusterEditPage, fetchClusterIngressVariablesSaga),
  takeLatest(submitForm.REQUEST, editClusterSaga),
  takeLatest(submitNewHostForm.REQUEST, addClusterIngressHostSaga),
  takeLatest(submitNewVariableForm.REQUEST, addClusterIngressVariableSaga),
  takeLatest(updateHostsForm.REQUEST, updateClusterIngressHostsSaga),
  takeLatest(updateVariablesForm.REQUEST, updateClusterIngressVariablesSaga),
];

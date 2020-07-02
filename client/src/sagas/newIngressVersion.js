import { takeLatest, call, put, select, race, take } from 'redux-saga/effects';
// import { push } from 'connected-react-router';
// import { get as _get } from 'lodash';
// import {
//   resetSection,
//   arrayPush,
//   SubmissionError,
//   arrayRemove,
//   startAsyncValidation,
//   stopAsyncValidation,
// } from 'redux-form';
import {
  initNewIngressVersionPage,
  FETCH_SERVICE_REQUEST,
  FETCH_SERVICE_SUCCESS,
  FETCH_SERVICE_ERROR,
  FETCH_INGRESS_HOSTS_REQUEST,
  FETCH_INGRESS_HOSTS_SUCCESS,
  FETCH_INGRESS_HOSTS_ERROR,
  FETCH_INGRESS_CLASSES_REQUEST,
  FETCH_INGRESS_CLASSES_SUCCESS,
  FETCH_INGRESS_CLASSES_ERROR,
  FETCH_TEAM_REQUEST,
  FETCH_TEAM_SUCCESS,
  FETCH_TEAM_ERROR,
  selectService,
  canManageRequest,
  setCanManage,
  canWriteIngressRequest,
  setCanWriteIngress,
} from '../modules/newIngressVersion';
import {
  getService,
  getIngressHosts,
  getIngressClasses,
  getCanManageAnyNamespace,
  getTeamForService,
  hasPermission,
} from '../lib/api';

export function* fetchNewJobVersionPageDataSaga({ payload: { match, ...options } }) {
  if (!match) return;
  const { registry, name: service } = match.params;
  yield put(FETCH_SERVICE_REQUEST());
  try {
    const data = yield call(getService, { registry, service });
    yield put(FETCH_SERVICE_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_SERVICE_ERROR({ error: error.message }));
  }
}

export function* fetchTeamForServiceSaga({ payload = {} }) {
  try {
    yield put(FETCH_TEAM_REQUEST());
    const raceResult = yield race({
      success: take(FETCH_SERVICE_SUCCESS),
      failure: take(FETCH_SERVICE_ERROR),
    });
    if (raceResult.failure) {
      yield put(FETCH_TEAM_ERROR());
      return;
    }
    const service = yield select(selectService);
    const data = yield call(getTeamForService, { registry: service.registry.name, service: service.name });
    yield put(FETCH_TEAM_SUCCESS({ data }));
  } catch (error) {
    console.error(error); // eslint-disable-line no-console
    yield put(FETCH_TEAM_ERROR());
  }
}

export function* fetchIngressHostsSaga({ payload: options }) {
  try {
    yield put(FETCH_INGRESS_HOSTS_REQUEST());

    const raceResult = yield race({
      success: take(FETCH_SERVICE_SUCCESS),
      failure: take(FETCH_SERVICE_ERROR),
    });
    if (raceResult.failure) {
      yield put(FETCH_INGRESS_HOSTS_ERROR());
      return;
    }
    const service = yield select(selectService);
    const data = yield call(getIngressHosts, { serviceId: service.id });
    yield put(FETCH_INGRESS_HOSTS_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_INGRESS_HOSTS_ERROR({ error: error.message }));
  }
}

export function* fetchIngressClassesSaga({ payload: options }) {
  try {
    yield put(FETCH_INGRESS_CLASSES_REQUEST());

    const raceResult = yield race({
      success: take(FETCH_SERVICE_SUCCESS),
      failure: take(FETCH_SERVICE_ERROR),
    });
    if (raceResult.failure) {
      yield put(FETCH_INGRESS_CLASSES_ERROR());
      return;
    }
    const service = yield select(selectService);
    const data = yield call(getIngressClasses, { serviceId: service.id });
    yield put(FETCH_INGRESS_CLASSES_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_INGRESS_CLASSES_ERROR({ error: error.message }));
  }
}

export function* checkPermissionSaga({ payload: { match, ...options }}) {
  try {
    yield put(canManageRequest());
    yield put(canWriteIngressRequest());
    const canMange = yield call(getCanManageAnyNamespace);
    yield put(setCanManage(canMange.answer));
    const canWriteIngress = yield call(hasPermission, 'ingress-write');
    yield put(setCanWriteIngress(canWriteIngress.answer));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
  }
}

// export function* submitSaga() {
//   try {
//     const values = yield select(getFormValues);
//     const job = yield select(selectJob);
//     const data = yield call(saveJobVersion, job, values);
//     yield put(submitForm.success());
//     yield put(push(`/cronjobs/version/${data.id}`));
//   } catch (err) {
//     console.error(err); // eslint-disable-line no-console
//     yield put(submitForm.failure(new SubmissionError({ _error: err.message || 'Something bad and unknown happened.' })));
//   }
// }

export default [
  takeLatest(initNewIngressVersionPage, fetchNewJobVersionPageDataSaga),
  takeLatest(initNewIngressVersionPage, checkPermissionSaga),
  takeLatest(initNewIngressVersionPage, fetchIngressHostsSaga),
  takeLatest(initNewIngressVersionPage, fetchIngressClassesSaga),
  takeLatest(initNewIngressVersionPage, fetchTeamForServiceSaga),
  // takeLatest(submitForm.REQUEST, submitSaga),
];

import { all, takeLatest } from 'redux-saga/effects';
import { LOCATION_CHANGE } from 'connected-react-router';

import accountSagas from './account';
import accountsSagas from './accounts';
import deploySagas from './deploy';
import deploymentSagas from './deployment';
import deploymentsSagas from './deployments';
import editAccountSagas from './editAccount';
import namespaceSagas from './namespace';
import namespaceEditSagas from './namespaceEdit';
import namespaceManageSagas from './namespaceManage';
import namespacesSagas from './namespaces';
import newSecretVersionSagas from './newSecretVersion';
import registriesSagas from './registries';
import releasesSagas from './releases';
import serviceSagas from './service';
import secretOverviewSagas from './secretOverview';
import secretVersionSagas from './secretVersion';
import serviceManageSagas from './serviceManage';
import servicesSagas from './services';
import viewAccountSagas from './viewAccount';
import { routesSaga } from '../paths';

export default function* rootSaga() {
  yield all([
    ...accountSagas,
    ...accountsSagas,
    ...deploySagas,
    ...deploymentSagas,
    ...deploymentsSagas,
    ...editAccountSagas,
    ...namespaceSagas,
    ...namespaceEditSagas,
    ...namespaceManageSagas,
    ...namespacesSagas,
    ...newSecretVersionSagas,
    ...registriesSagas,
    ...releasesSagas,
    ...serviceSagas,
    ...secretOverviewSagas,
    ...secretVersionSagas,
    ...serviceManageSagas,
    ...servicesSagas,
    ...viewAccountSagas,
    takeLatest(LOCATION_CHANGE, routesSaga),
  ]);
}

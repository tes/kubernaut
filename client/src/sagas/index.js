import { all, takeLatest } from 'redux-saga/effects';
import { LOCATION_CHANGE } from 'connected-react-router';

import accountSagas from './account';
import accountsSagas from './accounts';
import auditSagas from './audit';
import deploySagas from './deploy';
import deploymentSagas from './deployment';
import deploymentsSagas from './deployments';
import editAccountSagas from './editAccount';
import homeSagas from './home';
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
import serviceNamespaceAttrsSagas from './serviceNamespaceAttrs';
import servicesSagas from './services';
import teamSagas from './team';
import teamsSagas from './teams';
import viewAccountSagas from './viewAccount';
import { routesSaga } from '../paths';

export default function* rootSaga() {
  yield all([
    ...accountSagas,
    ...accountsSagas,
    ...auditSagas,
    ...deploySagas,
    ...deploymentSagas,
    ...deploymentsSagas,
    ...editAccountSagas,
    ...homeSagas,
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
    ...serviceNamespaceAttrsSagas,
    ...servicesSagas,
    ...teamSagas,
    ...teamsSagas,
    ...viewAccountSagas,
    takeLatest(LOCATION_CHANGE, routesSaga),
  ]);
}

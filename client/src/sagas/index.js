import { all, takeLatest } from 'redux-saga/effects';
import { LOCATION_CHANGE } from 'connected-react-router';

import accountSagas from './account';
import accountsSagas from './accounts';
import adminSagas from './admin';
import adminRestoreSagas from './adminRestore';
import auditSagas from './audit';
import clusterEditSagas from './clusterEdit';
import clustersSagas from './clusters';
import deploySagas from './deploy';
import deploymentSagas from './deployment';
import deploymentsSagas from './deployments';
import editAccountSagas from './editAccount';
import editAccountTeamsSagas from './editAccountTeams';
import editTeamSagas from './editTeam';
import homeSagas from './home';
import jobSagas from './job';
import jobsSagas from './jobs';
import jobVersionSagas from './jobVersion';
import namespaceSagas from './namespace';
import namespaceEditSagas from './namespaceEdit';
import namespaceManageSagas from './namespaceManage';
import namespacesSagas from './namespaces';
import newJobVersionSagas from './newJobVersion';
import newSecretVersionSagas from './newSecretVersion';
import registriesSagas from './registries';
import releasesSagas from './releases';
import serviceSagas from './service';
import secretOverviewSagas from './secretOverview';
import secretVersionSagas from './secretVersion';
import serviceManageSagas from './serviceManage';
import serviceNamespaceAttrsSagas from './serviceNamespaceAttrs';
import servicesSagas from './services';
import serviceStatusSagas from './serviceStatus';
import teamSagas from './team';
import teamAttrsSagas from './teamAttrs';
import teamsSagas from './teams';
import viewAccountSagas from './viewAccount';
import { routesSaga } from '../paths';

export default function* rootSaga() {
  yield all([
    ...accountSagas,
    ...accountsSagas,
    ...adminSagas,
    ...adminRestoreSagas,
    ...auditSagas,
    ...clusterEditSagas,
    ...clustersSagas,
    ...deploySagas,
    ...deploymentSagas,
    ...deploymentsSagas,
    ...editAccountSagas,
    ...editAccountTeamsSagas,
    ...editTeamSagas,
    ...homeSagas,
    ...jobSagas,
    ...jobsSagas,
    ...jobVersionSagas,
    ...namespaceSagas,
    ...namespaceEditSagas,
    ...namespaceManageSagas,
    ...namespacesSagas,
    ...newJobVersionSagas,
    ...newSecretVersionSagas,
    ...registriesSagas,
    ...releasesSagas,
    ...serviceSagas,
    ...secretOverviewSagas,
    ...secretVersionSagas,
    ...serviceManageSagas,
    ...serviceNamespaceAttrsSagas,
    ...servicesSagas,
    ...serviceStatusSagas,
    ...teamSagas,
    ...teamAttrsSagas,
    ...teamsSagas,
    ...viewAccountSagas,
    takeLatest(LOCATION_CHANGE, routesSaga),
  ]);
}

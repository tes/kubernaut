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
import registriesSagas from './registries';
import releasesSagas from './releases';
import serviceSagas from './service';
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
    ...registriesSagas,
    ...releasesSagas,
    ...serviceSagas,
    ...servicesSagas,
    ...viewAccountSagas,
    takeLatest(LOCATION_CHANGE, routesSaga),
  ]);
}

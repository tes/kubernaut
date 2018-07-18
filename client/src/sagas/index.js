import { all } from 'redux-saga/effects';

import accountSagas from './account';
import accountsSagas from './accounts';
import deploySagas from './deploy';
import deploymentSagas from './deployment';
import deploymentsSagas from './deployments';
import namespaceSagas from './namespace';
import namespacesSagas from './namespaces';
import registriesSagas from './registries';
import releasesSagas from './releases';
import serviceSagas from './service';

export default function* rootSaga() {
  yield all([
    ...accountSagas,
    ...accountsSagas,
    ...deploySagas,
    ...deploymentSagas,
    ...deploymentsSagas,
    ...namespaceSagas,
    ...namespacesSagas,
    ...registriesSagas,
    ...releasesSagas,
    ...serviceSagas,
  ]);
}

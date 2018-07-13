import { all } from 'redux-saga/effects';

import accountsSagas from './accounts';
import deploySagas from './deploy';
import deploymentsSagas from './deployments';
import namespaceSagas from './namespace';

export default function* rootSaga() {
  yield all([
    ...accountsSagas,
    ...deploySagas,
    ...deploymentsSagas,
    ...namespaceSagas,
  ]);
}

import { all } from 'redux-saga/effects';

import accountsSagas from './accounts';
import namespaceSagas from './namespace';

export default function* rootSaga() {
  yield all([
    ...accountsSagas,
    ...namespaceSagas,
  ]);
}

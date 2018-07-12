import { all } from 'redux-saga/effects';

import namespaceSagas from './namespace';

export default function* rootSaga() {
  yield all([
    ...namespaceSagas,
  ]);
}

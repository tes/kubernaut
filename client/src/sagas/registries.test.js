import { put, call } from 'redux-saga/effects';
import {
  fetchRegistriesDataSaga,
} from './registries';

import {
  fetchRegistriesPagination,
  FETCH_REGISTRIES_REQUEST,
  FETCH_REGISTRIES_SUCCESS,
  FETCH_REGISTRIES_ERROR,
} from '../modules/registries';

import {
  getRegistries,
} from '../lib/api';

describe('Registries sagas', () => {
  it('should fetch registries', () => {
    const registriesData = { limit: 50, offset: 0, count: 3, items: [1, 2, 3] };

    const gen = fetchRegistriesDataSaga(fetchRegistriesPagination());
    expect(gen.next().value).toMatchObject(put(FETCH_REGISTRIES_REQUEST()));
    expect(gen.next().value).toMatchObject(call(getRegistries, { limit: 50, offset: 0 }));
    expect(gen.next(registriesData).value).toMatchObject(put(FETCH_REGISTRIES_SUCCESS({ data: registriesData } )));
    expect(gen.next().done).toBe(true);
  });

  it('should tolerate errors fetching registries', () => {
    const error = new Error('ouch');
    const gen = fetchRegistriesDataSaga(fetchRegistriesPagination({ quiet: true }));
    expect(gen.next().value).toMatchObject(put(FETCH_REGISTRIES_REQUEST()));
    expect(gen.next().value).toMatchObject(call(getRegistries, { limit: 50, offset: 0 }));
    expect(gen.throw(error).value).toMatchObject(put(FETCH_REGISTRIES_ERROR({ error: error.message })));
    expect(gen.next().done).toBe(true);
  });

  it('should fetch registries pagination', () => {
    const registriesData = { limit: 50, offset: 50, count: 3, items: [1, 2, 3] };

    const gen = fetchRegistriesDataSaga(fetchRegistriesPagination({ page: 2 }));
    expect(gen.next().value).toMatchObject(put(FETCH_REGISTRIES_REQUEST()));
    expect(gen.next().value).toMatchObject(call(getRegistries, { limit: 50, offset: 50 }));
    expect(gen.next(registriesData).value).toMatchObject(put(FETCH_REGISTRIES_SUCCESS({ data: registriesData } )));
    expect(gen.next().done).toBe(true);
  });
});

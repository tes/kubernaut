import { put, call } from 'redux-saga/effects';
import {
  fetchServicesDataSaga,
} from '../services';

import {
  fetchServicesPagination,
  FETCH_SERVICES_REQUEST,
  FETCH_SERVICES_SUCCESS,
  FETCH_SERVICES_ERROR,
} from '../../modules/services';

import {
  getServices,
} from '../../lib/api';

describe('Services sagas', () => {
  it('should fetch services', () => {
    const servicesData = { limit: 50, offset: 0, count: 3, items: [1, 2, 3] };

    const gen = fetchServicesDataSaga(fetchServicesPagination());
    expect(gen.next().value).toMatchObject(put(FETCH_SERVICES_REQUEST()));
    expect(gen.next().value).toMatchObject(call(getServices, { limit: 50, offset: 0, sort: 'name', order: 'asc' }));
    expect(gen.next(servicesData).value).toMatchObject(put(FETCH_SERVICES_SUCCESS({ data: servicesData } )));
    expect(gen.next().done).toBe(true);
  });

  it('should tolerate errors fetching services', () => {
    const error = new Error('ouch');
    const gen = fetchServicesDataSaga(fetchServicesPagination({ quiet: true }));
    expect(gen.next().value).toMatchObject(put(FETCH_SERVICES_REQUEST()));
    expect(gen.next().value).toMatchObject(call(getServices, { limit: 50, offset: 0, sort: 'name', order: 'asc' }));
    expect(gen.throw(error).value).toMatchObject(put(FETCH_SERVICES_ERROR({ error: error.message })));
    expect(gen.next().done).toBe(true);
  });

  it('should fetch services pagination', () => {
    const servicesData = { limit: 50, offset: 50, count: 3, items: [1, 2, 3] };

    const gen = fetchServicesDataSaga(fetchServicesPagination({ page: 2 }));
    expect(gen.next().value).toMatchObject(put(FETCH_SERVICES_REQUEST()));
    expect(gen.next().value).toMatchObject(call(getServices, { limit: 50, offset: 50, sort: 'name', order: 'asc' }));
    expect(gen.next(servicesData).value).toMatchObject(put(FETCH_SERVICES_SUCCESS({ data: servicesData } )));
    expect(gen.next().done).toBe(true);
  });
});

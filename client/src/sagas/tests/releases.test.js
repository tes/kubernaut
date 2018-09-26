import { put, call, select } from 'redux-saga/effects';
import {
  fetchReleasesDataSaga,
} from '../releases';

import {
  fetchReleasesPagination,
  FETCH_RELEASES_REQUEST,
  FETCH_RELEASES_SUCCESS,
  FETCH_RELEASES_ERROR,
  selectTableFilters
} from '../../modules/releases';

import {
  getReleases,
} from '../../lib/api';

describe('Releases sagas', () => {
  it('should fetch releases', () => {
    const releasesData = { limit: 50, offset: 0, count: 3, items: [1, 2, 3] };

    const gen = fetchReleasesDataSaga(fetchReleasesPagination());
    expect(gen.next().value).toMatchObject(select(selectTableFilters));
    expect(gen.next({}).value).toMatchObject(put(FETCH_RELEASES_REQUEST()));
    expect(gen.next().value).toMatchObject(call(getReleases, { limit: 50, offset: 0 }));
    expect(gen.next(releasesData).value).toMatchObject(put(FETCH_RELEASES_SUCCESS({ data: releasesData } )));
    expect(gen.next().done).toBe(true);
  });

  it('should tolerate errors fetching releases', () => {
    const error = new Error('ouch');
    const gen = fetchReleasesDataSaga(fetchReleasesPagination({ quiet: true }));
    expect(gen.next().value).toMatchObject(select(selectTableFilters));
    expect(gen.next({}).value).toMatchObject(put(FETCH_RELEASES_REQUEST()));
    expect(gen.next().value).toMatchObject(call(getReleases, { limit: 50, offset: 0 }));
    expect(gen.throw(error).value).toMatchObject(put(FETCH_RELEASES_ERROR({ error: error.message })));
    expect(gen.next().done).toBe(true);
  });

  it('should fetch releases pagination', () => {
    const releasesData = { limit: 50, offset: 50, count: 3, items: [1, 2, 3] };

    const gen = fetchReleasesDataSaga(fetchReleasesPagination({ page: 2 }));
    expect(gen.next().value).toMatchObject(select(selectTableFilters));
    expect(gen.next({}).value).toMatchObject(put(FETCH_RELEASES_REQUEST()));
    expect(gen.next().value).toMatchObject(call(getReleases, { limit: 50, offset: 50 }));
    expect(gen.next(releasesData).value).toMatchObject(put(FETCH_RELEASES_SUCCESS({ data: releasesData } )));
    expect(gen.next().done).toBe(true);
  });
});

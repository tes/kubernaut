import { put, call, select } from 'redux-saga/effects';
import { push, getLocation } from 'connected-react-router';
import { reset } from 'redux-form';

import {
  fetchServicesDataSaga,
  addFilterSaga,
  removeFilterSaga,
  locationChangeSaga,
} from '../services';

import {
  fetchServicesPagination,
  selectTableFilters,
  selectSortState,
  FETCH_SERVICES_REQUEST,
  FETCH_SERVICES_SUCCESS,
  FETCH_SERVICES_ERROR,
  addFilter,
  removeFilter,
  setFilters,
  setSort,
} from '../../modules/services';

import {
  getServices,
} from '../../lib/api';

describe('Services sagas', () => {

  describe('Fetch', () => {
    const sortState = { column: 'name', order: 'asc' };
    it('should fetch services', () => {
      const servicesData = { limit: 50, offset: 0, count: 3, items: [1, 2, 3] };

      const gen = fetchServicesDataSaga(fetchServicesPagination());
      expect(gen.next().value).toMatchObject(select(selectSortState));
      expect(gen.next(sortState).value).toMatchObject(select(selectTableFilters));
      expect(gen.next({}).value).toMatchObject(put(FETCH_SERVICES_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getServices, { limit: 50, offset: 0, sort: 'name', order: 'asc' }));
      expect(gen.next(servicesData).value).toMatchObject(put(FETCH_SERVICES_SUCCESS({ data: servicesData } )));
      expect(gen.next().done).toBe(true);
    });

    it('should tolerate errors fetching services', () => {
      const error = new Error('ouch');
      const gen = fetchServicesDataSaga(fetchServicesPagination({ quiet: true }));
      expect(gen.next().value).toMatchObject(select(selectSortState));
      expect(gen.next(sortState).value).toMatchObject(select(selectTableFilters));
      expect(gen.next({}).value).toMatchObject(put(FETCH_SERVICES_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getServices, { limit: 50, offset: 0, sort: 'name', order: 'asc' }));
      expect(gen.throw(error).value).toMatchObject(put(FETCH_SERVICES_ERROR({ error: error.message })));
      expect(gen.next().done).toBe(true);
    });

    it('should fetch services pagination', () => {
      const servicesData = { limit: 50, offset: 50, count: 3, items: [1, 2, 3] };

      const gen = fetchServicesDataSaga(fetchServicesPagination({ page: 2 }));
      expect(gen.next().value).toMatchObject(select(selectSortState));
      expect(gen.next(sortState).value).toMatchObject(select(selectTableFilters));
      expect(gen.next({}).value).toMatchObject(put(FETCH_SERVICES_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getServices, { limit: 50, offset: 50, sort: 'name', order: 'asc' }));
      expect(gen.next(servicesData).value).toMatchObject(put(FETCH_SERVICES_SUCCESS({ data: servicesData } )));
      expect(gen.next().done).toBe(true);
    });
  });

  describe('Filters', () => {
    it('should add a filter', () => {
      const location = {
        pathname: '/services',
        search: '?a=b',
      };
      const filters = {
        abc: [{ value: '123', not: false, exact: false }],
      };

      const newUrl = '/services?a=b&filters=abc%3Dvalue%253A123';
      const gen = addFilterSaga(addFilter());
      expect(gen.next().value).toMatchObject(put(reset('services_table_filter')));
      expect(gen.next().value).toMatchObject(select(getLocation));
      expect(gen.next(location).value).toMatchObject(select(selectTableFilters));
      expect(gen.next(filters).value).toMatchObject(put(push(newUrl)));
      expect(gen.next().done).toBe(true);
    });

    it('should remove a filter', () => {
      const location = {
        pathname: '/services',
        search: '?a=b&filters=abc%3Dvalue%253A123%26def%3Dvalue%253Aabc',
      };
      const filters = {
        def: [{ value: 'abc', not: false, exact: false }],
      };

      const newUrl = '/services?a=b&filters=def%3Dvalue%253Aabc';
      const gen = removeFilterSaga(removeFilter());
      expect(gen.next().value).toMatchObject(select(getLocation));
      expect(gen.next(location).value).toMatchObject(select(selectTableFilters));
      expect(gen.next(filters).value).toMatchObject(put(push(newUrl)));
      expect(gen.next().done).toBe(true);
    });
  });

  describe('Location', () => {
    it('should only work for this page route', () => {
      const gen1 = locationChangeSaga({ payload: { location: { pathname: '/notservices'} } });
      expect(gen1.next().done).toBe(true);
    });

    it('should set filters from qs', () => {
      const location = {
        pathname: '/services',
        search: '?a=b&filters=abc%3Dvalue%253A123%26def%3Dvalue%253Aabc',
      };
      const gen = locationChangeSaga({ payload: { location } });
      expect(gen.next().value).toMatchObject(put(setFilters([
        {
          key: 'abc',
          value: '123',
          exact: false,
          not: false,
        },
        {
          key: 'def',
          value: 'abc',
          exact: false,
          not: false,
        },
      ])));
      expect(gen.next().value).toMatchObject(put(setSort({})));
      expect(gen.next().value).toMatchObject(put(fetchServicesPagination()));
      expect(gen.next().done).toBe(true);
    });

    it('should set sort from qs', () => {
      const location = {
        pathname: '/services',
        search: '?a=b&sort=column%3Dabc%26order%3Ddesc',
      };
      const gen = locationChangeSaga({ payload: { location } });
      expect(gen.next().value).toMatchObject(put(setFilters([])));
      expect(gen.next().value).toMatchObject(put(setSort({
        column: 'abc',
        order: 'desc',
      })));
      expect(gen.next().value).toMatchObject(put(fetchServicesPagination()));
      expect(gen.next().done).toBe(true);
    });
  });
});

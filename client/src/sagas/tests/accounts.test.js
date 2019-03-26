import { put, call, select } from 'redux-saga/effects';
import { push, getLocation } from 'connected-react-router';
import { reset } from 'redux-form';

import {
  fetchAccountsDataSaga,
  addFilterSaga,
  removeFilterSaga,
  locationChangeSaga,
  searchSaga,
  paginationSaga,
} from '../accounts';

import {
  initialiseAccountsPage,
  fetchAccounts,
  fetchAccountsPagination,
  FETCH_ACCOUNTS_REQUEST,
  FETCH_ACCOUNTS_SUCCESS,
  FETCH_ACCOUNTS_ERROR,
  selectSortState,
  selectTableFilters,
  selectSearchFilter,
  selectPaginationState,
  addFilter,
  removeFilter,
  search,
  setFilters,
  setSearch,
  setSort,
  setPagination,
} from '../../modules/accounts';

import {
  getAccounts,
} from '../../lib/api';

describe('Accounts sagas', () => {
  describe('Fetch', () => {
    const sortState = { column: 'name', order: 'asc' };
    const paginationState = { page: 1, limit: 50 };
    it('should fetch accounts', () => {
      const accountsData = { limit: 50, offset: 0, count: 3, items: [1, 2, 3] };

      const gen = fetchAccountsDataSaga(fetchAccounts());
      expect(gen.next().value).toMatchObject(select(selectPaginationState));
      expect(gen.next(paginationState).value).toMatchObject(select(selectSortState));
      expect(gen.next(sortState).value).toMatchObject(select(selectTableFilters, true));
      expect(gen.next({}).value).toMatchObject(put(FETCH_ACCOUNTS_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getAccounts, { limit: 50, offset: 0, sort: 'name', order: 'asc' }));
      expect(gen.next(accountsData).value).toMatchObject(put(FETCH_ACCOUNTS_SUCCESS({ data: accountsData } )));
      expect(gen.next().done).toBe(true);
    });

    it('should tolerate errors fetching accounts', () => {
      const error = new Error('ouch');
      const gen = fetchAccountsDataSaga(fetchAccounts({ quiet: true }));
      expect(gen.next().value).toMatchObject(select(selectPaginationState));
      expect(gen.next(paginationState).value).toMatchObject(select(selectSortState));
      expect(gen.next(sortState).value).toMatchObject(select(selectTableFilters, true));
      expect(gen.next({}).value).toMatchObject(put(FETCH_ACCOUNTS_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getAccounts, { limit: 50, offset: 0, sort: 'name', order: 'asc' }));
      expect(gen.throw(error).value).toMatchObject(put(FETCH_ACCOUNTS_ERROR({ error: error.message })));
      expect(gen.next().done).toBe(true);
    });

    it('should fetch accounts pagination', () => {
      const accountsData = { limit: 50, offset: 50, count: 3, items: [1, 2, 3] };

      const gen = fetchAccountsDataSaga(fetchAccounts({ page: 2 }));
      expect(gen.next().value).toMatchObject(select(selectPaginationState));
      expect(gen.next({ page: 2, limit: 50 }).value).toMatchObject(select(selectSortState));
      expect(gen.next(sortState).value).toMatchObject(select(selectTableFilters, true));
      expect(gen.next({}).value).toMatchObject(put(FETCH_ACCOUNTS_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getAccounts, { limit: 50, offset: 50, sort: 'name', order: 'asc' }));
      expect(gen.next(accountsData).value).toMatchObject(put(FETCH_ACCOUNTS_SUCCESS({ data: accountsData } )));
      expect(gen.next().done).toBe(true);
    });
  });

  describe('Filters', () => {
    it('should add a filter', () => {
      const location = {
        pathname: '/accounts',
        search: '?a=b',
      };
      const filters = {
        abc: [{ value: '123', not: false, exact: false }],
      };

      const newUrl = '/accounts?a=b&filters=abc%3Dvalue%253A123&pagination&search';
      const gen = addFilterSaga(addFilter());
      expect(gen.next().value).toMatchObject(put(reset('accounts_table_filter')));
      expect(gen.next().value).toMatchObject(select(getLocation));
      expect(gen.next(location).value).toMatchObject(select(selectTableFilters));
      expect(gen.next(filters).value).toMatchObject(put(push(newUrl)));
      expect(gen.next().done).toBe(true);
    });

    it('should remove a filter', () => {
      const location = {
        pathname: '/accounts',
        search: '?a=b&filters=abc%3Dvalue%253A123%26def%3Dvalue%253Aabc',
      };
      const filters = {
        def: [{ value: 'abc', not: false, exact: false }],
      };

      const newUrl = '/accounts?a=b&filters=def%3Dvalue%253Aabc&pagination';
      const gen = removeFilterSaga(removeFilter());
      expect(gen.next().value).toMatchObject(select(getLocation));
      expect(gen.next(location).value).toMatchObject(select(selectTableFilters));
      expect(gen.next(filters).value).toMatchObject(put(push(newUrl)));
      expect(gen.next().done).toBe(true);
    });

    it('should search', () => {
      const location = {
        pathname: '/accounts',
        search: '?a=b',
      };

      const searchState = {
        key: 'abc',
        value: 'bob',
        not: true,
        exact: false,
      };

      const newUrl = '/accounts?a=b&pagination&search=key%3Dabc%26value%3Dbob%26not%3Dtrue';
      const gen = searchSaga(search());
      expect(gen.next().value).toMatchObject(select(getLocation));
      expect(gen.next(location).value).toMatchObject(select(selectSearchFilter));
      expect(gen.next(searchState).value).toMatchObject(put(push(newUrl)));
      expect(gen.next().done).toBe(true);
    });
  });

  it('should paginate', () => {
    const location = {
      pathname: '/accounts',
      search: '?a=b',
    };

    const pagination = {
      page: 1,
      limit: 50,
    };

    const newUrl = '/accounts?a=b&pagination=limit%3D50%26page%3D1';
    const gen = paginationSaga(fetchAccountsPagination());
    expect(gen.next().value).toMatchObject(select(getLocation));
    expect(gen.next(location).value).toMatchObject(select(selectPaginationState));
    expect(gen.next(pagination).value).toMatchObject(put(push(newUrl)));
    expect(gen.next().done).toBe(true);
  });

  describe('Location', () => {
    it('should set filters from qs', () => {
      const location = {
        pathname: '/accounts',
        search: '?a=b&filters=abc%3Dvalue%253A123%26def%3Dvalue%253Aabc',
      };
      const gen = locationChangeSaga(initialiseAccountsPage({ location }));
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
      expect(gen.next().value).toMatchObject(put(setSearch({})));
      expect(gen.next().value).toMatchObject(put(setSort({})));
      expect(gen.next().value).toMatchObject(put(setPagination({})));
      expect(gen.next().value).toMatchObject(put(fetchAccounts()));
      expect(gen.next().done).toBe(true);
    });

    it('should set search from qs', () => {
      const location = {
        pathname: '/accounts',
        search: '?a=b&search=key%3Dabc%26value%3Dbob%26not%3Dtrue&pagination=',
      };
      const gen = locationChangeSaga(initialiseAccountsPage({ location }));
      expect(gen.next().value).toMatchObject(put(setFilters([])));
      expect(gen.next().value).toMatchObject(put(setSearch({
        key: 'abc',
        value: 'bob',
        not: true,
        exact: false,
      })));
      expect(gen.next().value).toMatchObject(put(setSort({})));
      expect(gen.next().value).toMatchObject(put(setPagination({})));
      expect(gen.next().value).toMatchObject(put(fetchAccounts()));
      expect(gen.next().done).toBe(true);
    });

    it('should set pagination from qs', () => {
      const location = {
        pathname: '/accounts',
        search: '?a=b&pagination=page%3D1%26limit%3D50',
      };
      const gen = locationChangeSaga(initialiseAccountsPage({ location }));
      expect(gen.next().value).toMatchObject(put(setFilters([])));
      expect(gen.next().value).toMatchObject(put(setSearch({})));
      expect(gen.next().value).toMatchObject(put(setSort({})));
      expect(gen.next().value).toMatchObject(put(setPagination({
        page: '1',
        limit: '50',
      })));
      expect(gen.next().value).toMatchObject(put(fetchAccounts()));
      expect(gen.next().done).toBe(true);
    });

    it('should set sort from qs', () => {
      const location = {
        pathname: '/accounts',
        search: '?a=b&sort=column%3Dabc%26order%3Ddesc',
      };
      const gen = locationChangeSaga(initialiseAccountsPage({ location }));
      expect(gen.next().value).toMatchObject(put(setFilters([])));
      expect(gen.next().value).toMatchObject(put(setSearch({})));
      expect(gen.next().value).toMatchObject(put(setSort({
        column: 'abc',
        order: 'desc',
      })));
      expect(gen.next().value).toMatchObject(put(setPagination({})));
      expect(gen.next().value).toMatchObject(put(fetchAccounts()));
      expect(gen.next().done).toBe(true);
    });
  });
});

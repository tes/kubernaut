import { put, call, select } from 'redux-saga/effects';
import {
  fetchTeamsDataSaga,
  fetchAccountsDataSaga,
  fetchServicesDataSaga,
} from '../teams';

import {
  fetchTeams,
  fetchServices,
  fetchAccounts,
  FETCH_TEAMS_REQUEST,
  FETCH_TEAMS_SUCCESS,
  FETCH_TEAMS_ERROR,
  FETCH_SERVICES_REQUEST,
  FETCH_SERVICES_SUCCESS,
  FETCH_SERVICES_ERROR,
  FETCH_ACCOUNTS_REQUEST,
  FETCH_ACCOUNTS_SUCCESS,
  FETCH_ACCOUNTS_ERROR,
  selectTeamsPaginationState,
  selectServicesPaginationState,
  selectAccountsPaginationState,
} from '../../modules/teams';

import {
  getTeams,
  getAccountsWithNoMembership,
  getServicesWithNoTeam,
} from '../../lib/api';

describe('Teams sagas', () => {
  const paginationState = { page: 1, limit: 20 };

  describe('fetch teams', () => {

    it('should fetch teams', () => {
      const teamsData = { count: 1, items: [{}], limit: 20, offset: 0 };

      const gen = fetchTeamsDataSaga(fetchTeams());
      expect(gen.next().value).toMatchObject(select(selectTeamsPaginationState));
      expect(gen.next(paginationState).value).toMatchObject(put(FETCH_TEAMS_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getTeams, { limit: 20, offset: 0 }));
      expect(gen.next(teamsData).value).toMatchObject(put(FETCH_TEAMS_SUCCESS({ data: teamsData } )));
      expect(gen.next().done).toBe(true);
    });

    it('should tolerate errors fetching teams', () => {
      const error = new Error('ouch');
      const gen = fetchTeamsDataSaga(fetchTeams({ quiet: true }));
      expect(gen.next().value).toMatchObject(select(selectTeamsPaginationState));
      expect(gen.next(paginationState).value).toMatchObject(put(FETCH_TEAMS_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getTeams, { limit: 20, offset: 0 }));
      expect(gen.throw(error).value).toMatchObject(put(FETCH_TEAMS_ERROR({ error: error.message })));
      expect(gen.next().done).toBe(true);
    });
  });

  describe('fetch services without team', () => {

    it('should fetch services', () => {
      const servicesData = { count: 1, items: [{}], limit: 20, offset: 0 };

      const gen = fetchServicesDataSaga(fetchServices());
      expect(gen.next().value).toMatchObject(select(selectServicesPaginationState));
      expect(gen.next(paginationState).value).toMatchObject(put(FETCH_SERVICES_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getServicesWithNoTeam, { limit: 20, offset: 0 }));
      expect(gen.next(servicesData).value).toMatchObject(put(FETCH_SERVICES_SUCCESS({ data: servicesData } )));
      expect(gen.next().done).toBe(true);
    });

    it('should tolerate errors fetching services', () => {
      const error = new Error('ouch');
      const gen = fetchServicesDataSaga(fetchServices({ quiet: true }));
      expect(gen.next().value).toMatchObject(select(selectServicesPaginationState));
      expect(gen.next(paginationState).value).toMatchObject(put(FETCH_SERVICES_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getServicesWithNoTeam, { limit: 20, offset: 0 }));
      expect(gen.throw(error).value).toMatchObject(put(FETCH_SERVICES_ERROR({ error: error.message })));
      expect(gen.next().done).toBe(true);
    });
  });

  describe('fetch accounts without membership', () => {

    it('should fetch accounts', () => {
      const accountsData = { count: 1, items: [{}], limit: 20, offset: 0 };

      const gen = fetchAccountsDataSaga(fetchAccounts());
      expect(gen.next().value).toMatchObject(select(selectAccountsPaginationState));
      expect(gen.next(paginationState).value).toMatchObject(put(FETCH_ACCOUNTS_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getAccountsWithNoMembership, { limit: 20, offset: 0 }));
      expect(gen.next(accountsData).value).toMatchObject(put(FETCH_ACCOUNTS_SUCCESS({ data: accountsData } )));
      expect(gen.next().done).toBe(true);
    });

    it('should tolerate errors fetching accounts', () => {
      const error = new Error('ouch');
      const gen = fetchAccountsDataSaga(fetchAccounts({ quiet: true }));
      expect(gen.next().value).toMatchObject(select(selectAccountsPaginationState));
      expect(gen.next(paginationState).value).toMatchObject(put(FETCH_ACCOUNTS_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getAccountsWithNoMembership, { limit: 20, offset: 0 }));
      expect(gen.throw(error).value).toMatchObject(put(FETCH_ACCOUNTS_ERROR({ error: error.message })));
      expect(gen.next().done).toBe(true);
    });
  });

});

import { put, call, take, select } from 'redux-saga/effects';
import { push, getLocation } from 'connected-react-router';

import {
  fetchTeamInfoSaga,
  locationChangeSaga,
  paginationSaga,
  fetchServicesForTeamSaga,
  fetchMembersForTeamSaga,
} from '../team';

import {
  initialiseTeamPage,
  fetchTeamPageData,
  FETCH_TEAM_REQUEST,
  FETCH_TEAM_SUCCESS,
  FETCH_TEAM_ERROR,
  FETCH_TEAM_SERVICES_REQUEST,
  FETCH_TEAM_SERVICES_SUCCESS,
  FETCH_TEAM_SERVICES_ERROR,
  FETCH_TEAM_MEMBERS_REQUEST,
  FETCH_TEAM_MEMBERS_SUCCESS,
  FETCH_TEAM_MEMBERS_ERROR,
  setPagination,
  setMembersPagination,
  fetchServices,
  fetchMembers,
  fetchServicesPagination,
  selectPaginationState,
  selectMembersPaginationState,
  selectTeam,
} from '../../modules/team';

import {
  getTeamByName,
  getTeamMembers,
  getTeamServices,
} from '../../lib/api';

describe('Team sagas', () => {
  const teamName = 'abc';
  const initPayload = { name: teamName, quiet: true };
  const paginationState = { page: 1, limit: 20 };
  const membersPaginationState = { page: 1, limit: 10 };

  describe('fetch team', () => {
    it('should fetch tean info', () => {
      const teamData = { name: 'bob', attributes: {}, services: [ { a: 1 }] };

      const gen = fetchTeamInfoSaga(fetchTeamPageData(initPayload));
      expect(gen.next().value).toMatchObject(put(FETCH_TEAM_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getTeamByName, teamName));
      expect(gen.next(teamData).value).toMatchObject(put(FETCH_TEAM_SUCCESS({ data: teamData } )));
      expect(gen.next().done).toBe(true);
    });

    it('should tolerate errors fetching team info', () => {
      const error = new Error('ouch');
      const gen = fetchTeamInfoSaga(fetchTeamPageData(initPayload));
      expect(gen.next().value).toMatchObject(put(FETCH_TEAM_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getTeamByName, teamName));
      expect(gen.throw(error).value).toMatchObject(put(FETCH_TEAM_ERROR({ error: error.message })));
      expect(gen.next().done).toBe(true);
    });
  });

  describe('fetch services', () => {
    const teamData = { id: 'abc' };
    it('should fetch services', () => {
      const servicesData = { count: 1, items: [{}], limit: 20, offset: 0 };

      const gen = fetchServicesForTeamSaga(fetchServices());
      expect(gen.next().value).toMatchObject(select(selectPaginationState));
      expect(gen.next(paginationState).value).toMatchObject(select(selectTeam));
      expect(gen.next(teamData).value).toMatchObject(put(FETCH_TEAM_SERVICES_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getTeamServices, { teamId: teamData.id, limit: 20, offset: 0 }));
      expect(gen.next(servicesData).value).toMatchObject(put(FETCH_TEAM_SERVICES_SUCCESS({ data: servicesData } )));
      expect(gen.next().done).toBe(true);
    });

    it('should tolerate errors fetching services', () => {
      const error = new Error('ouch');
      const gen = fetchServicesForTeamSaga(fetchServices({ quiet: true }));
      expect(gen.next().value).toMatchObject(select(selectPaginationState));
      expect(gen.next(paginationState).value).toMatchObject(select(selectTeam));
      expect(gen.next(teamData).value).toMatchObject(put(FETCH_TEAM_SERVICES_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getTeamServices, { teamId: teamData.id, limit: 20, offset: 0 }));
      expect(gen.throw(error).value).toMatchObject(put(FETCH_TEAM_SERVICES_ERROR({ error: error.message })));
      expect(gen.next().done).toBe(true);
    });

    it('should fetch services pagination', () => {
      const servicesData = { count: 1, items: [{}], limit: 20, offset: 0 };

      const gen = fetchServicesForTeamSaga(fetchServicesPagination({ ...initPayload, page: 2 }));
      expect(gen.next().value).toMatchObject(select(selectPaginationState));
      expect(gen.next({ page: 2, limit: 20 }).value).toMatchObject(select(selectTeam));
      expect(gen.next(teamData).value).toMatchObject(put(FETCH_TEAM_SERVICES_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getTeamServices, { teamId: teamData.id, limit: 20, offset: 20 }));
      expect(gen.next(servicesData).value).toMatchObject(put(FETCH_TEAM_SERVICES_SUCCESS({ data: servicesData } )));
      expect(gen.next().done).toBe(true);
    });
  });

  describe('fetch members', () => {
    const teamData = { id: 'abc' };
    it('should fetch services', () => {
      const membersData = { count: 1, items: [{}], limit: 20, offset: 0 };

      const gen = fetchMembersForTeamSaga(fetchMembers());
      expect(gen.next().value).toMatchObject(select(selectMembersPaginationState));
      expect(gen.next(membersPaginationState).value).toMatchObject(select(selectTeam));
      expect(gen.next(teamData).value).toMatchObject(put(FETCH_TEAM_MEMBERS_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getTeamMembers, { teamId: teamData.id, limit: 10, offset: 0 }));
      expect(gen.next(membersData).value).toMatchObject(put(FETCH_TEAM_MEMBERS_SUCCESS({ data: membersData } )));
      expect(gen.next().done).toBe(true);
    });

    it('should tolerate errors fetching services', () => {
      const error = new Error('ouch');
      const gen = fetchMembersForTeamSaga(fetchMembers({ quiet: true }));
      expect(gen.next().value).toMatchObject(select(selectMembersPaginationState));
      expect(gen.next(membersPaginationState).value).toMatchObject(select(selectTeam));
      expect(gen.next(teamData).value).toMatchObject(put(FETCH_TEAM_MEMBERS_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getTeamMembers, { teamId: teamData.id, limit: 10, offset: 0 }));
      expect(gen.throw(error).value).toMatchObject(put(FETCH_TEAM_MEMBERS_ERROR({ error: error.message })));
      expect(gen.next().done).toBe(true);
    });

    it('should fetch services pagination', () => {
      const membersData = { count: 1, items: [{}], limit: 20, offset: 0 };

      const gen = fetchMembersForTeamSaga(fetchMembers());
      expect(gen.next().value).toMatchObject(select(selectMembersPaginationState));
      expect(gen.next({ page: 2, limit: 20 }).value).toMatchObject(select(selectTeam));
      expect(gen.next(teamData).value).toMatchObject(put(FETCH_TEAM_MEMBERS_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getTeamMembers, { teamId: teamData.id, limit: 20, offset: 20 }));
      expect(gen.next(membersData).value).toMatchObject(put(FETCH_TEAM_MEMBERS_SUCCESS({ data: membersData } )));
      expect(gen.next().done).toBe(true);
    });
  });

  it('should push pagination state to url', () => {
    const gen = paginationSaga(fetchServicesPagination());
    expect(gen.next().value).toMatchObject(select(getLocation));
    expect(gen.next({ pathname: '/teams/bob', search: '' }).value).toMatchObject(select(selectPaginationState));
    expect(gen.next(paginationState).value).toMatchObject(select(selectMembersPaginationState));
    expect(gen.next(membersPaginationState).value).toMatchObject(put(push('/teams/bob?m-pagination=limit%3D10%26page%3D1&pagination=limit%3D20%26page%3D1')));
  });

  describe('locationChangeSaga', () => {
    it('should fetch team info and wait for success if missing (page load)', () => {
      const location = {
        pathname: '/teams/bob',
        search: '',
      };
      const match = {
        params: { team: 'bob' },
      };

      const gen = locationChangeSaga(initialiseTeamPage({ location, match }));
      expect(gen.next().value).toMatchObject(select(selectTeam));
      expect(gen.next({ name: '' }).value).toMatchObject(put(fetchTeamPageData({ name: 'bob' })));
      expect(gen.next().value).toMatchObject(take(FETCH_TEAM_SUCCESS));
      expect(gen.next().value).toMatchObject(put(setPagination({})));
      expect(gen.next().value).toMatchObject(put(setMembersPagination({})));
      expect(gen.next().value).toMatchObject(put(fetchServices()));
      expect(gen.next().value).toMatchObject(put(fetchMembers()));
      expect(gen.next().done).toBe(true);
    });

    it('should fetch team info and wait for success if url name is different from store', () => {
      const location = {
        pathname: '/namespaces/bob',
        search: '',
      };

      const match = {
        params: { team: 'bob' },
      };

      const gen = locationChangeSaga(initialiseTeamPage({ location, match }));
      expect(gen.next().value).toMatchObject(select(selectTeam));
      expect(gen.next({ team: 'abc' }).value).toMatchObject(put(fetchTeamPageData({ name: 'bob' })));
      expect(gen.next().value).toMatchObject(take(FETCH_TEAM_SUCCESS));
      expect(gen.next({ id: 'bob' }).value).toMatchObject(put(setPagination({})));
      expect(gen.next().value).toMatchObject(put(setMembersPagination({})));
      expect(gen.next().value).toMatchObject(put(fetchServices()));
      expect(gen.next().value).toMatchObject(put(fetchMembers()));
      expect(gen.next().done).toBe(true);
    });

    it('should parse and set pagination state', () => {
      const location = {
        pathname: '/teams/bob',
        search: '?m-pagination=limit%3D10%26page%3D1&pagination=limit%3D20%26page%3D1',
      };
      const match = {
        params: { team: 'bob' },
      };

      const gen = locationChangeSaga(initialiseTeamPage({ location, match }));
      expect(gen.next().value).toMatchObject(select(selectTeam));
      expect(gen.next({ id: 'abc' }).value).toMatchObject(put(fetchTeamPageData({ name: 'bob' })));
      expect(gen.next().value).toMatchObject(take(FETCH_TEAM_SUCCESS));
      expect(gen.next().value).toMatchObject(put(setPagination({
        page: '1',
        limit: '20',
      })));
      expect(gen.next().value).toMatchObject(put(setMembersPagination({
        page: '1',
        limit: '10',
      })));
      expect(gen.next().value).toMatchObject(put(fetchServices()));
      expect(gen.next().value).toMatchObject(put(fetchMembers()));
      expect(gen.next().done).toBe(true);
    });

  });

});

import { put, call, take } from 'redux-saga/effects';

import {
  fetchTeamInfoSaga,
  locationChangeSaga,
} from '../team';

import {
  initialiseTeamPage,
  fetchTeamPageData,
  FETCH_TEAM_REQUEST,
  FETCH_TEAM_SUCCESS,
  FETCH_TEAM_ERROR,
} from '../../modules/team';

import {
  getTeamByName
} from '../../lib/api';

describe('Team sagas', () => {
  const teamName = 'abc';
  const initPayload = { name: teamName, quiet: true };

  describe('fetch', () => {
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
      expect(gen.next({}).value).toMatchObject(put(fetchTeamPageData({ name: 'bob' })));
      expect(gen.next().value).toMatchObject(take(FETCH_TEAM_SUCCESS));
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
      expect(gen.next({ team: 'abc' }).value).toMatchObject(put(fetchTeamPageData({ name: 'bob' })));
      expect(gen.next().value).toMatchObject(take(FETCH_TEAM_SUCCESS));
      expect(gen.next().done).toBe(true);
    });

  });

});

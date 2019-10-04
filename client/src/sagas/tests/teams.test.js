import { put, call } from 'redux-saga/effects';
import {
  fetchTeamsDataSaga,
} from '../teams';

import {
  fetchTeamsPagination,
  FETCH_TEAMS_REQUEST,
  FETCH_TEAMS_SUCCESS,
  FETCH_TEAMS_ERROR,
} from '../../modules/teams';

import {
  getTeams,
} from '../../lib/api';

describe('Namespaces sagas', () => {
  it('should fetch namespaces', () => {
    const teamsData = { limit: 50, offset: 0, count: 3, items: [1, 2, 3] };

    const gen = fetchTeamsDataSaga(fetchTeamsPagination());
    expect(gen.next().value).toMatchObject(put(FETCH_TEAMS_REQUEST()));
    expect(gen.next().value).toMatchObject(call(getTeams, { limit: 20, offset: 0 }));
    expect(gen.next(teamsData).value).toMatchObject(put(FETCH_TEAMS_SUCCESS({ data: teamsData } )));
    expect(gen.next().done).toBe(true);
  });

  it('should tolerate errors fetching namespaces', () => {
    const error = new Error('ouch');
    const gen = fetchTeamsDataSaga(fetchTeamsPagination({ quiet: true }));
    expect(gen.next().value).toMatchObject(put(FETCH_TEAMS_REQUEST()));
    expect(gen.next().value).toMatchObject(call(getTeams, { limit: 20, offset: 0 }));
    expect(gen.throw(error).value).toMatchObject(put(FETCH_TEAMS_ERROR({ error: error.message })));
    expect(gen.next().done).toBe(true);
  });

  it('should fetch namespaces pagination', () => {
    const teamsData = { limit: 50, offset: 50, count: 3, items: [1, 2, 3] };

    const gen = fetchTeamsDataSaga(fetchTeamsPagination({ page: 2 }));
    expect(gen.next().value).toMatchObject(put(FETCH_TEAMS_REQUEST()));
    expect(gen.next().value).toMatchObject(call(getTeams, { limit: 20, offset: 20 }));
    expect(gen.next(teamsData).value).toMatchObject(put(FETCH_TEAMS_SUCCESS({ data: teamsData } )));
    expect(gen.next().done).toBe(true);
  });
});

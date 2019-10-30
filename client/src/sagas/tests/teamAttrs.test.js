import { put, call, take, select } from 'redux-saga/effects';
import { push } from 'connected-react-router';

import {
  fetchTeamSaga,
  checkPermissionSaga,
  saveAttributesSaga,
} from '../teamAttrs';

import {
  initForm,
  submitForm,
  selectTeam,
  FETCH_TEAM_REQUEST,
  FETCH_TEAM_SUCCESS,
  FETCH_TEAM_ERROR,
  setCanEdit,
} from '../../modules/teamAttrs';

import {
  getTeamByName,
  setTeamAttributes,
  hasPermissionOn,
} from '../../lib/api';

describe('TeamAttrs sagas', () => {
  const teamName = 'abc';
  const match = {
    params: { team: teamName },
  };
  const initPayload = { match };
  const team = { id: '123', name: teamName };

  it('should check permission', () => {

    const gen = checkPermissionSaga(initForm());
    expect(gen.next().value).toMatchObject(take(FETCH_TEAM_SUCCESS));
    expect(gen.next().value).toMatchObject(select(selectTeam));
    expect(gen.next(team).value).toMatchObject(call(hasPermissionOn, 'teams-manage', 'team', team.id));
    expect(gen.next({ answer: true }).value).toMatchObject(put(setCanEdit(true)));
    expect(gen.next().done).toBe(true);
  });

  describe('fetch team', () => {
    it('should fetch tean info', () => {
      const teamData = { name: 'bob', attributes: {} };

      const gen = fetchTeamSaga(initForm(initPayload));
      expect(gen.next().value).toMatchObject(put(FETCH_TEAM_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getTeamByName, teamName));
      expect(gen.next(teamData).value).toMatchObject(put(FETCH_TEAM_SUCCESS({ data: teamData } )));
      expect(gen.next().done).toBe(true);
    });

    it('should tolerate errors fetching team info', () => {
      const error = new Error('ouch');
      const gen = fetchTeamSaga(initForm({ ...initPayload, quiet: true }));
      expect(gen.next().value).toMatchObject(put(FETCH_TEAM_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getTeamByName, teamName));
      expect(gen.throw(error).value).toMatchObject(put(FETCH_TEAM_ERROR({ error: error.message })));
      expect(gen.next().done).toBe(true);
    });
  });

  describe('saveAttributesSaga', () => {

    it('saves attributes', () => {
      const formValues = {
        attributes: [
          { name: 'a', value: '123'},
          { name: 'b', value: '456'},
        ]
      };
      const gen = saveAttributesSaga(submitForm.request(formValues));
      expect(gen.next().value).toMatchObject(select(selectTeam));
      expect(gen.next(team).value).toMatchObject(call(setTeamAttributes, team.id, { a: '123', b: '456' }));
      expect(gen.next().value).toMatchObject(put(submitForm.success()));
      expect(gen.next().value).toMatchObject(put(push(`/teams/${team.name}`)));
      expect(gen.next().done).toBe(true);
    });
  });

});

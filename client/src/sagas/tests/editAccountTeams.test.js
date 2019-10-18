import { call, put, select } from 'redux-saga/effects';
import { startSubmit, stopSubmit } from 'redux-form';

import {
  fetchAccountInfoSaga,
  fetchTeamsSaga,
  addMembershipSaga,
  removeMembershipSaga,
  checkPermissionSaga,
} from '../editAccountTeams';

import {
  fetchAccountInfo,
  FETCH_ACCOUNT_REQUEST,
  FETCH_ACCOUNT_SUCCESS,
  FETCH_ACCOUNT_ERROR,
  FETCH_TEAMS_REQUEST,
  FETCH_TEAMS_SUCCESS,
  FETCH_TEAMS_ERROR,
  UPDATE_TEAM_MEMBERSHIP_SUCCESS,
  setCanEdit,
  setCanManageTeam,
  addMembership,
  removeMembership,
  selectAccount,
} from '../../modules/editAccountTeams';

import {
  getAccountById,
  getAccountTeamMembership,
  hasPermission,
  getCanManageAnyTeam,
  addTeamMembershipToAccount,
  removeTeamMembershipFromAccount,
} from '../../lib/api';

const quietOptions = { quiet: true };

describe('editAccountTeams sagas', () => {
  describe('fetchAccountInfoSaga', () => {
    it('should fetch and succeed at getting account data', () => {
      const data = { a: 1 };
      const accountId = '123';
      const match = { params: { accountId } };
      const gen = fetchAccountInfoSaga(fetchAccountInfo({ match }));
      expect(gen.next().value).toMatchObject(put(FETCH_ACCOUNT_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getAccountById, accountId));
      expect(gen.next(data).value).toMatchObject(put(FETCH_ACCOUNT_SUCCESS({ data })));
      expect(gen.next().done).toBe(true);
    });

    it('should handle errors', () => {
      const accountId = '123';
      const match = { params: { accountId } };
      const error = new Error('ouch');
      const gen = fetchAccountInfoSaga(fetchAccountInfo({ ...quietOptions, match }));
      expect(gen.next().value).toMatchObject(put(FETCH_ACCOUNT_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getAccountById, accountId));
      expect(gen.throw(error).value).toMatchObject(put(FETCH_ACCOUNT_ERROR({ error: error.message })));
      expect(gen.next().done).toBe(true);
    });
  });

  describe('fetchTeamsSaga', () => {
    it('should fetch teams', () => {
      const accountId = '123';
      const match = { params: { accountId } };
      const teamsData = { abc: 123 };

      const gen = fetchTeamsSaga(fetchAccountInfo({ match }));
      expect(gen.next().value).toMatchObject(put(FETCH_TEAMS_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getAccountTeamMembership, accountId));
      expect(gen.next(teamsData).value).toMatchObject(put(FETCH_TEAMS_SUCCESS({ data: teamsData } )));
      expect(gen.next().done).toBe(true);
    });

    it('should tolerate errors fetching teams', () => {
      const accountId = '123';
      const match = { params: { accountId } };
      const error = new Error('ouch');
      const gen = fetchTeamsSaga(fetchAccountInfo({ ...quietOptions, match }));
      expect(gen.next().value).toMatchObject(put(FETCH_TEAMS_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getAccountTeamMembership, accountId));
      expect(gen.throw(error).value).toMatchObject(put(FETCH_TEAMS_ERROR({ error: error.message })));
      expect(gen.next().done).toBe(true);
    });
  });

  describe('addMembershipSaga', () => {
    it('add a new team membership', () => {
      const teamId = 'abc';
      const account = { id: '123' };
      const resultData = { bob: 1 };

      const gen = addMembershipSaga(addMembership());
      gen.next(); // form selector
      expect(gen.next(teamId).value).toMatchObject(put(startSubmit('accountTeamMembership')));
      expect(gen.next().value).toMatchObject(select(selectAccount));
      expect(gen.next(account).value).toMatchObject(call(addTeamMembershipToAccount, account.id, teamId));
      expect(gen.next(resultData).value).toMatchObject(put(UPDATE_TEAM_MEMBERSHIP_SUCCESS({ data: resultData })));
      expect(gen.next().value).toMatchObject(put(stopSubmit('accountTeamMembership')));
      expect(gen.next().done).toBe(true);
    });

    it('add returns when missing team', () => {
      const gen = addMembershipSaga(addMembership());
      gen.next(); // form selector
      expect(gen.next().done).toBe(true);
    });
  });


  describe('removeMembershipSaga', () => {
    it('removes membership from a team', () => {
      const teamId = 'abc';
      const account = { id: '123' };
      const resultData = { bob: 1 };

      const gen = removeMembershipSaga(removeMembership({ team: teamId }));
      expect(gen.next().value).toMatchObject(put(startSubmit('accountTeamMembership')));
      expect(gen.next().value).toMatchObject(select(selectAccount));
      expect(gen.next(account).value).toMatchObject(call(removeTeamMembershipFromAccount, account.id, teamId));
      expect(gen.next(resultData).value).toMatchObject(put(UPDATE_TEAM_MEMBERSHIP_SUCCESS({ data: resultData })));
      expect(gen.next().value).toMatchObject(put(stopSubmit('accountTeamMembership')));
      expect(gen.next().done).toBe(true);
    });
  });

  it('should check permission', () => {
    const gen = checkPermissionSaga(fetchAccountInfo());
    expect(gen.next().value).toMatchObject(call(hasPermission, 'accounts-write'));
    expect(gen.next({ answer: true }).value).toMatchObject(put(setCanEdit(true)));
    expect(gen.next().value).toMatchObject(call(getCanManageAnyTeam));
    expect(gen.next({ answer: true }).value).toMatchObject(put(setCanManageTeam(true)));
    expect(gen.next().done).toBe(true);
  });
});

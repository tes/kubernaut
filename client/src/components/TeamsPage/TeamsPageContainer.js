import { connect } from 'react-redux';
import TeamsPage from './TeamsPage';
import {
  fetchTeamsPagination,
  fetchAccountsPagination,
  fetchServicesPagination,
} from '../../modules/teams';

function mapStateToProps(state, props) {
  return {
    meta: state.teams.meta,
    teams: state.teams.teams,
    services: state.teams.services,
    accounts: state.teams.accounts,
  };
}

export default connect(mapStateToProps, {
  fetchTeamsPagination,
  fetchAccountsPagination,
  fetchServicesPagination,
})(TeamsPage);

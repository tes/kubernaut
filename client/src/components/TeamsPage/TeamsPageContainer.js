import { connect } from 'react-redux';
import TeamsPage from './TeamsPage';
import { fetchTeamsPagination } from '../../modules/teams';

function mapStateToProps(state, props) {
  return {
    teams: {
      data: state.teams.data,
      meta: state.teams.meta,
    },
  };
}

export default connect(mapStateToProps, { fetchTeamsPagination })(TeamsPage);

import { connect } from 'react-redux';
import { fetchServicesPagination, fetchMembersPagination } from '../../modules/team';
import TeamPage from './TeamPage';

export default connect((state) => ({
  team: state.team.team,
  services: state.team.services,
  members: state.team.members,
  meta: state.team.meta,
  canEdit: state.team.canEdit,
}),{
  fetchServicesPagination,
  fetchMembersPagination,
})(TeamPage);

import { connect } from 'react-redux';
import { fetchServicesPagination } from '../../modules/team';
import TeamPage from './TeamPage';

export default connect((state) => ({
  team: state.team.team,
  services: state.team.services,
  meta: state.team.meta,
  canEdit: state.team.canEdit,
}),{
  fetchServicesPagination,
})(TeamPage);

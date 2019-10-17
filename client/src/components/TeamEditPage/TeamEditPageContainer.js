import { connect } from 'react-redux';
import TeamEditPage from './TeamEditPage';

export default connect((state, props) => ({
  canEdit: state.editTeam.canEdit,
  canManageTeam: state.editTeam.canManageTeam,
  team: state.editTeam.team,
  meta: state.editTeam.meta,
}))(TeamEditPage);

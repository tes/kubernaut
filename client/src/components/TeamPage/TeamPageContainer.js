import { connect } from 'react-redux';

import TeamPage from './TeamPage';

export default connect((state) => ({
  team: state.team.team,
  canEdit: state.team.canEdit,
}),{})(TeamPage);

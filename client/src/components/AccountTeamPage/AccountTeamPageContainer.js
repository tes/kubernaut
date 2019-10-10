import { connect } from 'react-redux';
import AccountTeamPage from './AccountTeamPage';

export default connect((state, props) => ({
  canEdit: state.editAccountTeams.canEdit,
  canManageTeam: state.editAccountTeams.canManageTeam,
  accountId: props.accountId,
  account: state.editAccountTeams.account,
  meta: state.editAccountTeams.meta,
}))(AccountTeamPage);

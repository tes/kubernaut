import { connect } from 'react-redux';
import AdminSummaryPage from './AdminSummaryPage';

export default connect(({ account }) => ({
  canAudit: account && account.permissions && account.permissions['audit-read'],
}))(AdminSummaryPage);

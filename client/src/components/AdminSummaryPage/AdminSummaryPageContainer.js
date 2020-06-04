import { connect } from 'react-redux';
import AdminSummaryPage from './AdminSummaryPage';

export default connect(({ account, admin }) => ({
  canAudit: account && account.permissions && account.permissions['audit-read'],
  summary: admin.summary,
}))(AdminSummaryPage);

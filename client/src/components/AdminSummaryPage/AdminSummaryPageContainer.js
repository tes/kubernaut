import { connect } from 'react-redux';
import AdminSummaryPage from './AdminSummaryPage';

export default connect(({ account, admin }) => ({
  canAudit: account && account.permissions && account.permissions['audit-read'],
  hasClustersWrite: account && account.permissions && account.permissions['clusters-write'],
  summary: admin.summary,
}))(AdminSummaryPage);

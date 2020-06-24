import { connect } from 'react-redux';
import AdminSummaryPage from './AdminSummaryPage';

export default connect(({ account, admin }) => ({
  canAudit: account && account.permissions && account.permissions['audit-read'],
  hasClustersWrite: account && account.permissions && account.permissions['clusters-write'],
  hasIngressAdminWrite: account && account.permissions && account.permissions['ingress-admin'],
  summary: admin.summary,
}))(AdminSummaryPage);

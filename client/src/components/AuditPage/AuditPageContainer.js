import { connect } from 'react-redux';
import {
  fetchAuditPagination,
  addFilter,
  removeFilter,
} from '../../modules/audit';

import AuditPage from './AuditPage';

export default connect(({ audit, account }) => ({
  meta: audit.meta,
  audits: audit.data,
  filters: audit.filter.filters,
  canAudit: account && account.permissions && account.permissions['audit-read'],
}), {
  fetchAuditPagination,
  addFilter,
  removeFilter,
})(AuditPage);

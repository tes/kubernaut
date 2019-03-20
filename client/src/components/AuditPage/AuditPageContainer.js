import { connect } from 'react-redux';
import {
  fetchAuditPagination,
  addFilter,
  removeFilter,
} from '../../modules/audit';

import AuditPage from './AuditPage';

export default connect(({ audit }) => ({
  meta: audit.meta,
  audits: audit.data,
  filters: audit.filter.filters,
}), {
  fetchAuditPagination,
  addFilter,
  removeFilter,
})(AuditPage);

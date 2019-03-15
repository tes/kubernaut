import { connect } from 'react-redux';
import {
  fetchAuditPagination,
} from '../../modules/audit';

import AuditPage from './AuditPage';

export default connect(({ audit }) => ({
  meta: audit.meta,
  audits: audit.data,
}), {
  fetchAuditPagination,
})(AuditPage);

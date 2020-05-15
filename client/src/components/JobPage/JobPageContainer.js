import { connect } from 'react-redux';
import {
  fetchVersionsPagination,
  execute,
  closeModal,
} from '../../modules/job';
import JobPage from './JobPage';

export default connect((state) => ({
  job: state.job.job,
  versions: state.job.versions,
  snapshot: state.job.snapshot,
  meta: state.job.meta,
  canEdit: state.job.canEdit,
  canApply: state.job.canApply,
  logOpen: state.job.logOpen,
  applyLog: state.job.applyLog,
  applyError: state.job.applyError,
}),{
  fetchVersionsPagination,
  execute,
  closeModal,
})(JobPage);

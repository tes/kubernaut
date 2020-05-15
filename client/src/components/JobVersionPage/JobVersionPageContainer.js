import { connect } from 'react-redux';
import JobVersionPage from './JobVersionPage';
import {
  apply,
  closeModal,
} from '../../modules/jobVersion';

export default connect((state) => ({
  jobVersion: state.jobVersion.jobVersion,
  meta: state.jobVersion.meta,
  logOpen: state.jobVersion.logOpen,
  applyLog: state.jobVersion.applyLog,
  applyError: state.jobVersion.applyError,
  canApply: state.jobVersion.canApply,
}),{
  apply,
  closeModal,
})(JobVersionPage);

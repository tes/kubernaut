import { connect } from 'react-redux';
import {
  reduxForm,
} from 'redux-form';
import {
  fetchVersionsPagination,
  execute,
  closeModal,
  submitDescription,
  editDescription,
  openDeleteModal,
  deleteJob,
  openStopModal,
  stopJob,
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
  initialValues: state.job.initialValues,
  editDescriptionOpen: state.job.editDescriptionOpen,
  deleteModalOpen: state.job.deleteModalOpen,
  stopModalOpen: state.job.stopModalOpen,
}), {
  fetchVersionsPagination,
  execute,
  closeModal,
  submitDescription,
  editDescription,
  openDeleteModal,
  deleteJob,
  openStopModal,
  stopJob,
})(reduxForm({
  form: 'jobPage',
  enableReinitialize: true,
  destroyOnUnmount: false,
})(JobPage));

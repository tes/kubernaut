import { connect } from 'react-redux';
import { fetchVersionsPagination } from '../../modules/job';
import JobPage from './JobPage';

export default connect((state) => ({
  job: state.job.job,
  versions: state.job.versions,
  meta: state.job.meta,
  canEdit: state.job.canEdit,
}),{
  fetchVersionsPagination,
})(JobPage);

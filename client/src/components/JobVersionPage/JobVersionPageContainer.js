import { connect } from 'react-redux';
import JobVersionPage from './JobVersionPage';
import {
  apply,
} from '../../modules/jobVersion';

export default connect((state) => ({
  jobVersion: state.jobVersion.jobVersion,
  meta: state.jobVersion.meta,
}),{
  apply,
})(JobVersionPage);

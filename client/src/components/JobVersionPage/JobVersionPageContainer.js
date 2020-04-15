import { connect } from 'react-redux';
import JobVersionPage from './JobVersionPage';

export default connect((state) => ({
  jobVersion: state.jobVersion.jobVersion,
  meta: state.jobVersion.meta,
}),{})(JobVersionPage);

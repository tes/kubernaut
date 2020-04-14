import { connect } from 'react-redux';
import JobsPage from './JobsPage';
import { fetchJobsPagination } from '../../modules/jobs';

function mapStateToProps(state, props) {
  return {
    jobs: {
      data: state.jobs.data,
      meta: state.jobs.meta,
    },
  };
}

export default connect(mapStateToProps, { fetchJobsPagination })(JobsPage);

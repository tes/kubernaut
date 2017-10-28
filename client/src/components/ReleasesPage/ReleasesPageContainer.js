import { connect, } from 'react-redux';
import { fetchReleases, } from '../../actions/release';

import ReleasesPage from './ReleasesPage';

function mapStateToProps(state, props) {
  return {
    releases: {
      data: state.releases.data,
      meta: state.releases.meta,
    },
  };
}

function mapDispatchToProps(dispatch) {
  return {
    fetchReleases: () => {
      dispatch(fetchReleases());
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ReleasesPage);

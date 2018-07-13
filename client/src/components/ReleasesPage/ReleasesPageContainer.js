import { connect } from 'react-redux';
import { fetchReleasesPagination } from '../../modules/releases';

import ReleasesPage from './ReleasesPage';

function mapStateToProps(state, props) {
  return {
    releases: {
      data: state.releases.data,
      meta: state.releases.meta,
    },
  };
}

const mapDispatchToProps = {
  fetchReleasesPagination,
};

export default connect(mapStateToProps, mapDispatchToProps)(ReleasesPage);

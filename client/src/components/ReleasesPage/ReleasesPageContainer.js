import { connect } from 'react-redux';
import { fetchReleases } from '../../modules/releases';

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
  fetchReleases,
};

export default connect(mapStateToProps, mapDispatchToProps)(ReleasesPage);

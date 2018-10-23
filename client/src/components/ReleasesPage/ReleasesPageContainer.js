import { connect } from 'react-redux';
import {
  fetchReleasesPagination,
  toggleSort,
  addFilter,
  removeFilter,
  search,
  clearSearch,
  showFilters,
  hideFilters,
} from '../../modules/releases';

import ReleasesPage from './ReleasesPage';

function mapStateToProps(state, props) {
  return {
    releases: {
      data: state.releases.data,
      meta: state.releases.meta,
    },
    sort: state.releases.sort,
  };
}

const mapDispatchToProps = {
  toggleSort,
  fetchReleasesPagination,
  addFilter,
  removeFilter,
  search,
  clearSearch,
  showFilters,
  hideFilters,
};

export default connect(mapStateToProps,
mapDispatchToProps,
null,
{
  areStatesEqual: (next, prev) => (
    next.releases.data === prev.releases.data &&
    next.releases.meta === prev.releases.meta &&
    next.releases.sort === prev.releases.sort
  )
})(ReleasesPage);

import { connect } from 'react-redux';
import {
  initialise,
  fetchDeploymentsPagination,
  toggleSort,
  addFilter,
  removeFilter,
  search,
  clearSearch,
  showFilters,
  hideFilters,
} from '../../modules/deployments';

import DeploymentsPage from './DeploymentsPage';

function mapStateToProps(state, props) {
  return {
    deployments: {
      data: state.deployments.data,
      meta: state.deployments.meta,
    },
    sort: state.deployments.sort,
  };
}

const mapDispatchToProps = {
  initialise,
  fetchDeploymentsPagination,
  toggleSort,
  addFilter,
  removeFilter,
  search,
  clearSearch,
  showFilters,
  hideFilters,
};

export default connect(mapStateToProps, mapDispatchToProps)(DeploymentsPage);

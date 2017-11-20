import { connect, } from 'react-redux';
import { fetchDeployments, } from '../../actions/deployment';

import DeploymentsPage from './DeploymentsPage';

function mapStateToProps(state, props) {
  return {
    deployments: {
      data: state.deployments.data,
      meta: state.deployments.meta,
    },
  };
}

function mapDispatchToProps(dispatch) {
  return {
    fetchDeployments: () => {
      dispatch(fetchDeployments());
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(DeploymentsPage);

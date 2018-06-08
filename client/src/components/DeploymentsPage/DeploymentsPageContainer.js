import { connect } from 'react-redux';
import { fetchDeployments } from '../../modules/deployments';

import DeploymentsPage from './DeploymentsPage';

function mapStateToProps(state, props) {
  return {
    deployments: {
      data: state.deployments.data,
      meta: state.deployments.meta,
    },
  };
}

const mapDispatchToProps = {
  fetchDeployments,
};

export default connect(mapStateToProps, mapDispatchToProps)(DeploymentsPage);

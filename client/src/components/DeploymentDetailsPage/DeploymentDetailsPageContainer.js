import { connect } from 'react-redux';
import { fetchDeployment } from '../../actions/deployment';

import DeploymentDetailsPage from './DeploymentDetailsPage';

function mapStateToProps(state, props) {
  return {
    deploymentId: props.deploymentId,
    deployment: state.deployment.data,
    meta: state.deployment.meta,
  };
}

function mapDispatchToProps(dispatch, props) {
  return {
    fetchDeployment: (options) => {
      dispatch(fetchDeployment(props.deploymentId, options));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(DeploymentDetailsPage);

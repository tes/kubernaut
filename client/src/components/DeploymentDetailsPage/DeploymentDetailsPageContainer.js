import { connect } from 'react-redux';
import { fetchDeployment } from '../../modules/deployment';

import DeploymentDetailsPage from './DeploymentDetailsPage';

function mapStateToProps(state, props) {
  return {
    deploymentId: props.deploymentId,
    deployment: state.deployment.data,
    meta: state.deployment.meta,
  };
}

export default connect(mapStateToProps, {
  fetchDeployment,
})(DeploymentDetailsPage);

import { connect } from 'react-redux';
import {
  fetchReleasesPagination,
  fetchDeploymentsPagination,
} from '../../modules/service';
import ServiceDetailsPage from './ServiceDetailsPage';

export default connect((state, { registryName, serviceName }) => ({
  routeInfo: {
    registryName,
    serviceName,
  },
  releasesList: state.service.releases,
  deploymentsList: state.service.deployments,
  latestDeployments: state.service.latestDeployments.data,
  releasesNamespaceHistory: state.service.releasesNamespaceHistory.data,
  deploymentsWithNotes: state.service.deploymentsWithNotes.data,
  canManage: state.service.canManage,
}),{
  fetchReleasesPagination,
  fetchDeploymentsPagination,
})(ServiceDetailsPage);

import { connect } from 'react-redux';
import { fetchVersionsPagination } from '../../modules/secretOverview';
import SecretOverviewPage from './SecretOverviewPage';

export default connect(({ secretOverview, account }, { registryName, serviceName }) => ({
  canManage: secretOverview.canManage,
  meta: secretOverview.meta,
  registryName,
  serviceName,
  namespace: secretOverview.namespace,
  versions: secretOverview.versions,
}),{
  fetchVersionsPagination,
})(SecretOverviewPage);

import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import {
  changeToNamespace,
} from '../../modules/serviceStatus';
import ServiceStatusPage from './ServiceStatusPage';

export default connect((state, { registryName, serviceName }) => ({
  routeInfo: {
    registryName,
    serviceName,
  },
  canManage: state.serviceStatus.canManage,
  team: state.serviceStatus.team,
  meta: state.serviceStatus.meta,
  status: state.serviceStatus.status,
  namespacesRich: state.serviceStatus.latestDeployments.data,
  initialValues: state.serviceStatus.initialValues,
}),{
  changeToNamespace,
})(reduxForm({
  form: 'serviceStatus',
  enableReinitialize: true,
  destroyOnUnmount: false,
})(ServiceStatusPage));

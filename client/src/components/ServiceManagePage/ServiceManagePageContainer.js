import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';

import { updateServiceStatusForNamespace, fetchNamespacesPagination } from '../../modules/serviceManage';
import ServiceManagePage from './ServiceManagePage';

export default connect(({ serviceManage, account }, { registryName, serviceName }) => ({
  canManage: serviceManage.canManage,
  meta: serviceManage.meta,
  initialValues: serviceManage.initialValues,
  registryName,
  serviceName,
  serviceId: serviceManage.id,
  namespaces: serviceManage.namespaces,
  team: serviceManage.team,
}),{
  updateServiceStatusForNamespace,
  fetchNamespacesPagination,
})(reduxForm({
  form: 'serviceManage',
  enableReinitialize: true,
  destroyOnUnmount: false,
})(ServiceManagePage));

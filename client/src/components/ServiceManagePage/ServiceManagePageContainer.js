import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';

import {
  updateServiceStatusForNamespace,
  fetchNamespacesPagination,
  updateTeamOwnership,
  openDeleteModal,
  closeDeleteModal,
  deleteService,
} from '../../modules/serviceManage';
import ServiceManagePage from './ServiceManagePage';

export default connect(({ serviceManage, account }, { registryName, serviceName }) => ({
  canManage: serviceManage.canManage,
  canDelete: serviceManage.canDelete,
  canManageTeamForService: serviceManage.canManageTeamForService,
  meta: serviceManage.meta,
  initialValues: serviceManage.initialValues,
  registryName,
  serviceName,
  serviceId: serviceManage.id,
  namespaces: serviceManage.namespaces,
  team: serviceManage.team,
  manageableTeams: serviceManage.manageableTeams,
  deleteModalOpen: serviceManage.deleteModalOpen,
}),{
  updateServiceStatusForNamespace,
  fetchNamespacesPagination,
  updateTeamOwnership,
  openDeleteModal,
  closeDeleteModal,
  deleteService,
})(reduxForm({
  form: 'serviceManage',
  enableReinitialize: true,
  destroyOnUnmount: false,
})(ServiceManagePage));

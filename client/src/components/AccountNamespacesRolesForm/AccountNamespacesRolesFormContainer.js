import { connect } from 'react-redux';
import { reduxForm, formValueSelector } from 'redux-form';
import AccountNamespacesRolesForm from './AccountNamespacesRolesForm';
import {
  updateRolesForNamespace,
  addNewNamespace,
  deleteRolesForNamespace,
} from '../../modules/editAccount';
import Account from '../../lib/domain/Account';

const formName = 'accountNamespacesRoles';
const valuesSelector = formValueSelector(formName);

export default connect((state, props) => {
  const account = new Account(state.editAccount.account);

  const userNamespaces = account.listNamespaceIdsWithRoleAsObject();
  const namespaceIdsCurrentUserCanSee = props.namespaces.items.map(({ id }) => (id));

  const namespacesOfUserCurrentUserCanSee = Object.keys(userNamespaces).filter((id) => {
    return namespaceIdsCurrentUserCanSee.indexOf(id) > -1;
  });

  let formCurrentValues = {};
  if (namespacesOfUserCurrentUserCanSee.length > 0) {
    namespacesOfUserCurrentUserCanSee.forEach((id) => {
      formCurrentValues = {
        ...formCurrentValues,
        [id]: valuesSelector(state, id),
      };
    });
  }

  const userNamespaceIds = Object.keys(userNamespaces);

  const namespacesPossibleToAdd = namespaceIdsCurrentUserCanSee.filter((
    (id) => userNamespaceIds.indexOf(id) === -1
  ));

  return {
    initialValues: {
      ...userNamespaces,
    },
    currentValues: formCurrentValues,
    fieldNamespaceIds: namespacesOfUserCurrentUserCanSee,
    namespaceData: props.namespaces,
    namespacesPossibleToAdd,
  };
},{
  updateRolesForNamespace,
  addNewNamespace,
  deleteRolesForNamespace,
})(reduxForm({
  form: formName,
  enableReinitialize: true,
  destroyOnUnmount: false,
})(AccountNamespacesRolesForm));

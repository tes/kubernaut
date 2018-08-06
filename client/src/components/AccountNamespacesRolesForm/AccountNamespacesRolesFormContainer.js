import { connect } from 'react-redux';
import { reduxForm, formValueSelector } from 'redux-form';
import AccountNamespacesRolesForm from './AccountNamespacesRolesForm';
import { updateRolesForNamespace } from '../../modules/editAccount';
import Account from '../../lib/domain/Account';

const formName = 'accountNamespacesRoles';
const valuesSelector = formValueSelector(formName);

export default connect((state, props) => {
  const account = new Account(props.accountData);

  const namespaces = account.listNamespaceIdsWithRoleAsObject();
  // const namespaces = Object.keys(namespaceIds).reduce((acc, namespace) => {
  //   acc.push({ name: namespace, roles: namespaceIds[namespace] });
  //   return acc;
  // }, []);

  const namespacesCurrentUserCanSee = Object.keys(namespaces).filter((id) => {
    return props.namespaces.items.find((namespace) => (id === namespace.id));
  });

  let formCurrentValues = {};
  if (namespacesCurrentUserCanSee.length > 0) {
    formCurrentValues = valuesSelector(state, ...namespacesCurrentUserCanSee);
  }

  return {
    initialValues: {
      ...namespaces,
    },
    currentValues: formCurrentValues,
    namespaceIds: namespacesCurrentUserCanSee,
    namespaceData: props.namespaces,
  };
},{
  updateRolesForNamespace,
})(reduxForm({
  form: formName,
  enableReinitialize: true,
  destroyOnUnmount: false,
})(AccountNamespacesRolesForm));

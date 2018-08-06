import { connect } from 'react-redux';
import { reduxForm, formValueSelector } from 'redux-form';
import AccountRegistriesRolesForm from './AccountRegistriesRolesForm';
import {
  updateRolesForRegistry,
  addNewRegistry,
  deleteRolesForRegistry,
} from '../../modules/editAccount';
import Account from '../../lib/domain/Account';

const formName = 'accountRegistriesRoles';
const valuesSelector = formValueSelector(formName);

export default connect((state, props) => {
  const account = new Account(state.editAccount.account);

  const userRegistries = account.listRegistryIdsWithRoleAsObject();
  const registryIdsCurrentUserCanSee = props.registries.items.map(({ id }) => (id));

  const registriesOfUserCurrentUserCanSee = Object.keys(userRegistries).filter((id) => {
    return registryIdsCurrentUserCanSee.indexOf(id) > -1;
  });

  let formCurrentValues = {};
  if (registriesOfUserCurrentUserCanSee.length > 0) {
    registriesOfUserCurrentUserCanSee.forEach((id) => {
      formCurrentValues = {
        ...formCurrentValues,
        [id]: valuesSelector(state, id),
      };
    });
  }

  const userRegistryIds = Object.keys(userRegistries);

  const registriesPossibleToAdd = registryIdsCurrentUserCanSee.filter((
    (id) => userRegistryIds.indexOf(id) === -1
  ));

  return {
    initialValues: {
      ...userRegistries,
    },
    currentValues: formCurrentValues,
    fieldRegistryIds: registriesOfUserCurrentUserCanSee,
    registryData: props.registries,
    registriesPossibleToAdd,
  };
},{
  updateRolesForRegistry,
  addNewRegistry,
  deleteRolesForRegistry,
})(reduxForm({
  form: formName,
  enableReinitialize: true,
  destroyOnUnmount: false,
})(AccountRegistriesRolesForm));

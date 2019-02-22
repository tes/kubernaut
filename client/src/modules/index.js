import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import { connectRouter } from 'connected-react-router';

import account from './account';
import accounts from './accounts';
import deploy from './deploy';
import deployment from './deployment';
import deployments from './deployments';
import editAccount from './editAccount';
import namespace from './namespace';
import namespaceEdit from './namespaceEdit';
import namespaceManage from './namespaceManage';
import namespaces from './namespaces';
import registries from './registries';
import releases from './releases';
import service from './service';
import secretOverview from './secretOverview';
import secretVersion from './secretVersion';
import serviceManage from './serviceManage';
import services from './services';
import viewAccount from './viewAccount';

export default (history) => combineReducers({
  form: formReducer,
  router: connectRouter(history),
  account,
  accounts,
  deploy,
  deployment,
  deployments,
  editAccount,
  namespace,
  namespaceEdit,
  namespaceManage,
  namespaces,
  registries,
  releases,
  service,
  secretOverview,
  secretVersion,
  serviceManage,
  services,
  viewAccount,
});

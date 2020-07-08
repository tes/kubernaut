import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import { connectRouter } from 'connected-react-router';

import account from './account';
import accounts from './accounts';
import admin from './admin';
import adminIngress from './adminIngress';
import adminRestore from './adminRestore';
import audit from './audit';
import clusterEdit from './clusterEdit';
import clusters from './clusters';
import deploy from './deploy';
import deployment from './deployment';
import deployments from './deployments';
import editAccount from './editAccount';
import editAccountTeams from './editAccountTeams';
import editTeam from './editTeam';
import home from './home';
import job from './job';
import jobs from './jobs';
import jobVersion from './jobVersion';
import namespace from './namespace';
import namespaceEdit from './namespaceEdit';
import namespaceManage from './namespaceManage';
import namespaces from './namespaces';
import newIngressVersion from './newIngressVersion';
import newJobVersion from './newJobVersion';
import newSecretVersion from './newSecretVersion';
import registries from './registries';
import releases from './releases';
import service from './service';
import secretOverview from './secretOverview';
import secretVersion from './secretVersion';
import serviceIngress from './serviceIngress';
import serviceManage from './serviceManage';
import serviceNamespaceAttrs from './serviceNamespaceAttrs';
import services from './services';
import serviceStatus from './serviceStatus';
import team from './team';
import teamAttrs from './teamAttrs';
import teams from './teams';
import viewAccount from './viewAccount';


export default (history) => combineReducers({
  form: formReducer,
  router: connectRouter(history),
  account,
  accounts,
  admin,
  adminIngress,
  adminRestore,
  audit,
  clusterEdit,
  clusters,
  deploy,
  deployment,
  deployments,
  editAccount,
  editAccountTeams,
  editTeam,
  home,
  job,
  jobs,
  jobVersion,
  namespace,
  namespaceEdit,
  namespaceManage,
  namespaces,
  newIngressVersion,
  newJobVersion,
  newSecretVersion,
  registries,
  releases,
  service,
  secretOverview,
  secretVersion,
  serviceIngress,
  serviceManage,
  serviceNamespaceAttrs,
  services,
  serviceStatus,
  team,
  teamAttrs,
  teams,
  viewAccount,
});

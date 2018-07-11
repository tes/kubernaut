import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';

import registries from './registries';
import namespaces from './namespaces';
import accounts from './accounts';
import releases from './releases';
import deployments from './deployments';
import deployment from './deployment';
import service from './service';
import deploy from './deploy';
import namespace from './namespace';

export default combineReducers({
  form: formReducer,
  registries,
  namespaces,
  accounts,
  releases,
  deployments,
  deployment,
  service,
  deploy,
  namespace,
});

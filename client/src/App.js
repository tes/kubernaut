// Framework
import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { connectRouter, routerMiddleware, ConnectedRouter } from 'connected-react-router';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { reducer as formReducer } from 'redux-form';
import { composeWithDevTools } from 'redux-devtools-extension';
import { parse as parseQuery } from 'query-string';
import 'bootstrap';

// Components
import Header from './components/Header';
import RegistriesPage from './components/RegistriesPage';
import NamespacesPage from './components/NamespacesPage';
import AccountsPage from './components/AccountsPage';
import ReleasesPage from './components/ReleasesPage';
import DeploymentsPage from './components/DeploymentsPage';
import DeploymentDetailsPage from './components/DeploymentDetailsPage';
import ServiceDetailsPage from './components/ServiceDetailsPage';
import DeployPage from './components/DeployPage';
import HomePage from './components/HomePage';

// Reducers
import registries from './modules/registries';
import namespaces from './modules/namespaces';
import accounts from './modules/accounts';
import releases from './modules/releases';
import deployments from './modules/deployments';
import deployment from './modules/deployment';
import service from './modules/service';

// Styles
import 'font-awesome/css/font-awesome.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'; // Must be imported after bootstrap css

/***************************************************************
Using require and assigning jQuery to window to workaround the
following errors on npm start and npm test:

  1) 'Bootstrap's JavaScript requires jQuery' error
  2) Uncaught ReferenceError: define is not defined

***************************************************************/
window.jQuery = window.$ = require('jquery');
// require('bootstrap/dist/js/bootstrap.min.js');

const history = createBrowserHistory();
const initialState = {};
const rootReducer = combineReducers({
  form: formReducer,
  registries,
  namespaces,
  accounts,
  releases,
  deployments,
  deployment,
  service,
});

const store = createStore(
  connectRouter(history)(rootReducer),
  initialState,
  composeWithDevTools(
    applyMiddleware(routerMiddleware(history), thunk)
  )
);


class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <div>
            <Header />
            <div className='container'>
              <Switch>
                <Route
                  exact
                  path='/registries'
                  render={() => <RegistriesPage /> }
                />
                <Route
                  exact
                  path='/namespaces'
                  render={() => <NamespacesPage /> }
                />
                <Route
                  exact
                  path='/accounts'
                  render={() => <AccountsPage /> }
                />
                <Route
                  exact
                  path='/releases'
                  render={() => <ReleasesPage /> }
                />
                <Route
                  exact
                  path='/deployments'
                  render={() => <DeploymentsPage /> }
                />
                <Route
                  exact
                  path='/deployments/:deploymentId'
                  render={({ match }) =>
                    <DeploymentDetailsPage
                      deploymentId={match.params.deploymentId}
                    />
                  }
                />
                <Route
                  exact
                  path='/services/:registry/:name'
                  render={({ match }) =>
                    <ServiceDetailsPage
                      registryName={match.params.registry}
                      serviceName={match.params.name}
                    />
                  }
                />
                <Route
                  exact
                  path='/deploy'
                  render={({ location }) => {
                    const parsedQueryString = parseQuery(location.search);
                    return <DeployPage parsedLocation={parsedQueryString} />;
                  }}
                />
                <Route
                  path='/'
                  render={() => <HomePage /> }
                />
              </Switch>
            </div>
          </div>
        </ConnectedRouter>
      </Provider>
    );
  }
}

export default App;

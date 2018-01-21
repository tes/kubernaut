// Framework
import React, { Component, } from 'react';
import { BrowserRouter as Router, Route, Switch, } from 'react-router-dom';
import { createStore, combineReducers, applyMiddleware, } from 'redux';
import thunk from 'redux-thunk';
import { Provider, } from 'react-redux';
import { composeWithDevTools, } from 'redux-devtools-extension';

// Components
import Header from './components/Header';
import RegistriesPage from './components/RegistriesPage';
import NamespacesPage from './components/NamespacesPage';
import AccountsPage from './components/AccountsPage';
import ReleasesPage from './components/ReleasesPage';
import DeploymentsPage from './components/DeploymentsPage';
import DeploymentDetailsPage from './components/DeploymentDetailsPage';
import HomePage from './components/HomePage';

// Reducers
import registries from './reducers/registries';
import namespaces from './reducers/namespaces';
import accounts from './reducers/accounts';
import releases from './reducers/releases';
import deployments from './reducers/deployments';
import deployment from './reducers/deployment';

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
require('bootstrap/dist/js/bootstrap.min.js');

const initialState = {};

const store = createStore(combineReducers({
  registries,
  namespaces,
  accounts,
  releases,
  deployments,
  deployment,
}), initialState, composeWithDevTools(
  applyMiddleware(thunk)
));


class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <Router>
          <div>
            <Header />
            <div className='container'>
              <Switch>
                <Route exact path='/registries' render={() =>
                  <RegistriesPage />
                } />
                <Route exact path='/namespaces' render={() =>
                  <NamespacesPage />
                } />
                <Route exact path='/accounts' render={() =>
                  <AccountsPage />
                } />
                <Route exact path='/releases' render={() =>
                  <ReleasesPage />
                } />
                <Route exact path='/deployments' render={() =>
                  <DeploymentsPage />
                } />
                <Route exact path='/deployments/:deploymentId' render={({ match, }) =>
                  <DeploymentDetailsPage deploymentId={match.params.deploymentId} />
                } />
                <Route path='/' render={() =>
                  <HomePage />
                } />
              </Switch>
            </div>
          </div>
        </Router>
      </Provider>
    );
  }
}

export default App;

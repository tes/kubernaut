import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { parse as parseQuery } from 'query-string';

// Components
import AccountEditPage from './components/AccountEditPage';
import AccountPage from './components/AccountPage';
import AccountsPage from './components/AccountsPage';
import DeployPage from './components/DeployPage';
import DeploymentsPage from './components/DeploymentsPage';
import DeploymentDetailsPage from './components/DeploymentDetailsPage';
import HomePage from './components/HomePage';
import NamespacesPage from './components/NamespacesPage';
import NamespaceDetailsPage from './components/NamespaceDetailsPage';
import NamespaceEditPage from './components/NamespaceEditPage';
import NamespaceManagePage from './components/NamespaceManagePage';
import RegistriesPage from './components/RegistriesPage';
import ReleasesPage from './components/ReleasesPage';
import ServicesPage from './components/ServicesPage';
import ServiceDetailsPage from './components/ServiceDetailsPage';

import paths from './paths';

export default () => <Switch>
  <Route
    exact
    path={paths.registries}
    render={() => <RegistriesPage /> }
  />
  <Route
    exact
    path={paths.namespaces}
    render={() => <NamespacesPage /> }
  />
  <Route
    exact
    path={paths.namespace}
    render={({ match }) =>
      <NamespaceDetailsPage
        namespaceId={match.params.namespaceId}
      /> }
  />
  <Route
    exact
    path={paths.namespaceEdit}
    render={({ match }) =>
      <NamespaceEditPage
        namespaceId={match.params.namespaceId}
      /> }
  />
  <Route
    exact
    path={paths.namespaceManage}
    render={({ match }) =>
      <NamespaceManagePage
        namespaceId={match.params.namespaceId}
      /> }
  />
  <Route
    exact
    path={paths.accounts}
    render={() => <AccountsPage /> }
  />
  <Route
    exact
    path={paths.account}
    render={({ match }) =>
      <AccountPage
        accountId={match.params.accountId}
      /> }
  />
  <Route
    exact
    path={paths.accountEdit}
    render={({ match }) =>
      <AccountEditPage
        accountId={match.params.accountId}
      /> }
  />
  <Route
    exact
    path={paths.releases}
    render={() => <ReleasesPage /> }
  />
  <Route
    exact
    path={paths.deployments}
    render={() => <DeploymentsPage /> }
  />
  <Route
    exact
    path={paths.deployment}
    render={({ match }) =>
      <DeploymentDetailsPage
        deploymentId={match.params.deploymentId}
      />
    }
  />
  <Route
    exact
    path={paths.services}
    render={() => <ServicesPage /> }
  />
  <Route
    exact
    path={paths.service}
    render={({ match }) =>
      <ServiceDetailsPage
        registryName={match.params.registry}
        serviceName={match.params.name}
      />
    }
  />
  <Route
    exact
    path={paths.deploy}
    render={({ location }) => {
      const parsedQueryString = parseQuery(location.search);
      return <DeployPage parsedLocation={parsedQueryString} />;
    }}
  />
  <Route
    path={paths.home}
    render={() => <HomePage /> }
  />
</Switch>;

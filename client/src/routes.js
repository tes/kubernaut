import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { parse as parseQuery } from 'query-string';

// Components
import Title from './components/Title';
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

import { fetchDeployment } from './modules/deployment';

const Wrapper = ({ title, children }) => (
  <div>
    <Title title={title} />
    {children}
  </div>
);

export default ({ dispatch }) => <Switch>
  <Route
    exact
    path={paths.registries}
    render={() => <Wrapper title="Registries"><RegistriesPage /></Wrapper> }
  />
  <Route
    exact
    path={paths.namespaces}
    render={() => <Wrapper title="Namespaces"><NamespacesPage /></Wrapper> }
  />
  <Route
    exact
    path={paths.namespace}
    render={({ match }) =>
      <Wrapper title="Namespace">
        <NamespaceDetailsPage
          namespaceId={match.params.namespaceId}
        />
      </Wrapper>
    }
  />
  <Route
    exact
    path={paths.namespaceEdit}
    render={({ match }) =>
      <Wrapper title="Edit namespace">
        <NamespaceEditPage
          namespaceId={match.params.namespaceId}
        />
      </Wrapper>
    }
  />
  <Route
    exact
    path={paths.namespaceManage}
    render={({ match }) =>
      <Wrapper title="Manage namespace">
        <NamespaceManagePage
          namespaceId={match.params.namespaceId}
        />
      </Wrapper>
    }
  />
  <Route
    exact
    path={paths.accounts}
    render={() => <Wrapper title="Accounts"><AccountsPage /></Wrapper> }
  />
  <Route
    exact
    path={paths.account}
    render={({ match }) =>
      <Wrapper title="Account">
        <AccountPage
          accountId={match.params.accountId}
        />
      </Wrapper>
    }
  />
  <Route
    exact
    path={paths.accountEdit}
    render={({ match }) =>
      <Wrapper title="Edit account">
        <AccountEditPage
          accountId={match.params.accountId}
          />
      </Wrapper>
    }
  />
  <Route
    exact
    path={paths.releases}
    render={() => <Wrapper title="Releases"><ReleasesPage /></Wrapper> }
  />
  <Route
    exact
    path={paths.deployments}
    render={() => <Wrapper title="Deployments"><DeploymentsPage /></Wrapper> }
  />
  <Route
    exact
    path={paths.deployment}
    render={({ match }) => {
      dispatch(fetchDeployment({ id: match.params.deploymentId }));
      return (
        <Wrapper>
          <DeploymentDetailsPage />
        </Wrapper>
      );
    }}
  />
  <Route
    exact
    path={paths.services}
    render={() => <Wrapper title="Services"><ServicesPage /></Wrapper> }
  />
  <Route
    exact
    path={paths.service}
    render={({ match }) =>
      <Wrapper title="Service">
        <ServiceDetailsPage
          registryName={match.params.registry}
          serviceName={match.params.name}
        />
      </Wrapper>
    }
  />
  <Route
    exact
    path={paths.deploy}
    render={({ location }) => {
      const parsedQueryString = parseQuery(location.search);
      return <Wrapper title="Deploy"><DeployPage parsedLocation={parsedQueryString} /></Wrapper>;
    }}
  />
  <Route
    path={paths.home}
    render={() => <Wrapper><HomePage /></Wrapper> }
  />
</Switch>;

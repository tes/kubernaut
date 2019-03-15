import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { parse as parseQuery } from 'query-string';

// Components
import Title from './components/Title';
//   Pages
import AccountEditPage from './components/AccountEditPage';
import AccountPage from './components/AccountPage';
import AccountsPage from './components/AccountsPage';
import AuditPage from './components/AuditPage';
import DeployPage from './components/DeployPage';
import DeploymentsPage from './components/DeploymentsPage';
import DeploymentDetailsPage from './components/DeploymentDetailsPage';
import HomePage from './components/HomePage';
import NamespacesPage from './components/NamespacesPage';
import NamespaceDetailsPage from './components/NamespaceDetailsPage';
import NamespaceEditPage from './components/NamespaceEditPage';
import NamespaceManagePage from './components/NamespaceManagePage';
import NewSecretVersionPage from './components/NewSecretVersionPage';
import RegistriesPage from './components/RegistriesPage';
import ReleasesPage from './components/ReleasesPage';
import ServicesPage from './components/ServicesPage';
import ServiceDetailsPage from './components/ServiceDetailsPage';
import ServiceManagePage from './components/ServiceManagePage';
import ServiceNamespaceAttrsPage from './components/ServiceNamespaceAttrsPage';
import SecretOverviewPage from './components/SecretOverviewPage';
import SecretVersionViewPage from './components/SecretVersionViewPage';

import paths from './paths';

const Wrapper = ({ title, children }) => (
  <div>
    <Title title={title} />
    {children}
  </div>
);

export default () => <Switch>
  <Route
    exact
    path={paths.registries.route}
    render={() => <Wrapper title="Registries"><RegistriesPage /></Wrapper>}
  />
  <Route
    exact
    path={paths.namespaces.route}
    render={() => <Wrapper title="Namespaces"><NamespacesPage /></Wrapper>}
  />
  <Route
    exact
    path={paths.namespace.route}
    render={(props) => <Wrapper title="Namespace">
          <NamespaceDetailsPage
            namespaceId={props.match.params.namespaceId}
            />
        </Wrapper>}
  />
  <Route
    exact
    path={paths.namespaceEdit.route}
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
    path={paths.namespaceManage.route}
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
    path={paths.accounts.route}
    render={() => <Wrapper title="Accounts"><AccountsPage /></Wrapper> }
  />
  <Route
    exact
    path={paths.account.route}
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
    path={paths.accountEdit.route}
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
    path={paths.releases.route}
    render={() => <Wrapper title="Releases"><ReleasesPage /></Wrapper> }
  />
  <Route
    exact
    path={paths.deployments.route}
    render={() => <Wrapper title="Deployments"><DeploymentsPage /></Wrapper> }
  />
  <Route
    exact
    path={paths.deployment.route}
    render={({ match }) => <Wrapper>
          <DeploymentDetailsPage />
        </Wrapper>}
  />
  <Route
    exact
    path={paths.services.route}
    render={() => <Wrapper title="Services"><ServicesPage /></Wrapper> }
  />
  <Route
    exact
    path={paths.service.route}
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
    path={paths.serviceManage.route}
    render={({ match }) =>
      <Wrapper title="Service">
        <ServiceManagePage
          registryName={match.params.registry}
          serviceName={match.params.name}
        />
      </Wrapper>
    }
  />
  <Route
    exact
    path={paths.serviceNamespaceAttrs.route}
    render={({ match }) =>
      <Wrapper title="Service Attributes">
        <ServiceNamespaceAttrsPage
          registryName={match.params.registry}
          serviceName={match.params.name}
        />
      </Wrapper>
    }
  />
  <Route
    exact
    path={paths.secretOverview.route}
    render={({ match }) =>
      <Wrapper title="Secret">
        <SecretOverviewPage
          registryName={match.params.registry}
          serviceName={match.params.name}
        />
      </Wrapper>
    }
  />
  <Route
    exact
    path={paths.newSecretVersion.route}
    render={({ match }) =>
      <Wrapper title="Secret">
        <NewSecretVersionPage
          registryName={match.params.registry}
          serviceName={match.params.name}
        />
      </Wrapper>
    }
  />
  <Route
    exact
    path={paths.secretVersion.route}
    render={({ match }) =>
      <Wrapper title="Secret">
        <SecretVersionViewPage
          version={match.params.version}
        />
      </Wrapper>
    }
  />
  <Route
    exact
    path={paths.deploy.route}
    render={({ location }) => {
      const parsedQueryString = parseQuery(location.search);
      return <Wrapper title="Deploy"><DeployPage parsedLocation={parsedQueryString} /></Wrapper>;
    }}
  />
  <Route
    path={paths.audit.route}
    render={() => <Wrapper><AuditPage /></Wrapper> }
  />
  <Route
    path={paths.home.route}
    render={() => <Wrapper><HomePage /></Wrapper> }
  />
</Switch>;

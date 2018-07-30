import React from 'react';
import { Link } from 'react-router-dom';
import { stringify } from 'query-string';

export const AccountLink = ({ account }) => {
  return (
    <Link to={`/accounts/${account.id}`}><span>{account.displayName}</span></Link>
  );
};

export const RegistryLink = ({ registry }) => {
  // TODO Replace with Link when page availalbe
  return (
    <span>{registry.name}</span>
  );
};

export const ServiceLink = ({ service }) => {
  return (
    <Link to={`/services/${service.registry.name}/${service.name}`}><span>{service.name}</span></Link>
  );
};

export const ReleaseLink = ({ release }) => {
  // TODO Replace with Link when page availalbe
  return (
    <span>{release.version}</span>
  );
};

export const ClusterLink = ({ cluster }) => {
  // TODO Replace with Link when page availalbe
  return (
    <span>{cluster.name}</span>
  );
};

export const NamespaceLink = ({ namespace }) => {
  return (
    <Link to={`/namespaces/${namespace.id}`}><span>{namespace.name}</span></Link>
  );
};

export const DeploymentLink = ({ deployment, icon }) => {
  return (
    <Link to={`/deployments/${deployment.id}`}><i className={`fa fa-${icon}`} aria-hidden='true'></i></Link>
  );
};

export const CreateDeploymentLink = ({ registry = {}, service = {}, version, cluster = {}, namespace = {}, children }) => {
  const element = children || (<span>Deploy</span>);
  return (
    <Link to={{
        pathname: "/deploy",
        search: stringify({
          registry: registry.name || '',
          service: service.name || '',
          version,
          cluster: cluster.name || '',
          namespace: namespace.name || '',
        })
      }}
    >{element}</Link>
  );
};

export const EditNamespaceLink = ({ namespace = {}, namespaceId, children}) =>
  <Link to={`/namespaces/${namespace.id || namespaceId}/edit`}>{children || <span>Edit</span>}</Link>;

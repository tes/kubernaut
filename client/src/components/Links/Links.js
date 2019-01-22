import React from 'react';
import { Link } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import { stringify } from 'query-string';
import { Badge } from 'reactstrap';

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

export const NamespaceLink = ({ namespace, pill = false, showCluster = false }) => {
  const text = `${showCluster ? `${namespace.cluster.name}/` : ''}${namespace.name}`;
  const element = pill ? (
    <Badge
      style={{
        backgroundColor: namespace.color || namespace.cluster.color
      }}
      pill
      className="shadow-sm"
    >{namespace.cluster.name}/{namespace.name}
    </Badge>
  ) : (<span>{text}</span>);

  return (
    <Link to={`/namespaces/${namespace.id}`}>{element}</Link>
  );
};

export const DeploymentLink = ({ deployment, icon, children }) => {
  const element = children || (<i className={`fa fa-${icon}`} aria-hidden='true'></i>);
  return (
    <Link to={`/deployments/${deployment.id}`}>{element}</Link>
  );
};

export const CreateDeploymentLink = ({ registry = {}, service = {}, version, cluster = {}, namespace = {}, text, children }) => {
  const element = children || (<span>{text ? text : 'Deploy'}</span>);
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

export const ManageNamespaceLink = ({ namespace = {}, namespaceId, children}) =>
  <Link to={`/namespaces/${namespace.id || namespaceId}/manage`}>{children || <span>Manage</span>}</Link>;

export const EditAccountLink = ({ account = {}, accountId, children}) =>
  <Link to={`/accounts/${account.id || accountId}/edit`}>{children || <span>Edit</span>}</Link>;

export const ServiceLink = ({ service, serviceName, registryName, children, container }) => {
  const Tag = container ? LinkContainer : Link;
  const props = {
    to: `/services/${registryName || service.registry.name}/${serviceName || service.name}`,
    ...container && { exact: true }
  };

  return <Tag {...props}>{children || <span>{serviceName || service.name}</span>}</Tag>;
};

export const ManageServiceLink = ({ registryName, serviceName, children, container }) => {
  const Tag = container ? LinkContainer : Link;
  const props = {
    to: `/services/${registryName}/${serviceName}/manage`,
    ...container && { exact: true }
  };

  return <Tag {...props}>{children || <span>Manage</span>}</Tag>;
};

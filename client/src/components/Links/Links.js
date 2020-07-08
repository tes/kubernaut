import React from 'react';
import { Link } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import { matchPath } from 'react-router';
import { stringify } from 'query-string';
import { Badge } from 'reactstrap';
import paths from '../../paths';
import { Human } from '../DisplayDate';

const { serviceStatus, serviceIngress } = paths;

export const AccountLink = ({ account, children, container }) => {
  const Tag = container ? LinkContainer : Link;
  const props = {
    to: `/accounts/${account.id}`,
    ...container && { exact: true }
  };

  return <Tag {...props}>{children || <span>{account.displayName}</span>}</Tag>;
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

export const NewJobVersionLink = ({ job, container, children }) => {
  const Tag = container ? LinkContainer : Link;
  const props = {
    to: `/cronjobs/${job.id}/new`,
    ...container && { exact: true }
  };

  return <Tag {...props}>{children || <span>New version</span>}</Tag>;
};

export const JobLink = ({ job, container, children }) => {
  const Tag = container ? LinkContainer : Link;
  const props = {
    to: `/cronjobs/${job.id}`,
    ...container && { exact: true }
  };

  return <Tag {...props}>{children || <span><i className="fa fa-cogs" aria-hidden='true'></i> {job.name}</span>}</Tag>;
};

export const JobVersionLink = ({ version, container, children }) => {
  const Tag = container ? LinkContainer : Link;
  const props = {
    to: `/cronjobs/version/${version.id}`,
    ...container && { exact: true }
  };

  return <Tag {...props}>{children || <span><i className="fa fa-file-text" aria-hidden='true'></i> <Human date={version.createdOn} /></span>}</Tag>;
};

export const TeamLink = ({ team, container, children }) => {
  const Tag = container ? LinkContainer : Link;
  const props = {
    to: `/teams/${team.name}`,
    ...container && { exact: true }
  };

  return <Tag {...props}>{children || <span><i className="fa fa-users" aria-hidden='true'></i> {team.name}</span>}</Tag>;
};

export const TeamEditLink = ({ team, container, children }) => {
  const Tag = container ? LinkContainer : Link;
  const props = {
    to: `/teams/${team.name}/edit`,
    ...container && { exact: true }
  };

  return <Tag {...props}>{children || <span>Edit Permissions</span>}</Tag>;
};

export const TeamAttributesLink = ({ team, container, children }) => {
  const Tag = container ? LinkContainer : Link;
  const props = {
    to: `/teams/${team.name}/attributes`,
    ...container && { exact: true }
  };

  return <Tag {...props}>{children || <span><i className="fa fa-tags" aria-hidden='true'></i> Attributes</span>}</Tag>;
};

export const NamespacePill = ({ namespace }) => <Badge
    style={{
      backgroundColor: namespace.color || namespace.cluster.color
    }}
    pill
    className="shadow-sm"
  >{namespace.cluster.name}/{namespace.name}</Badge>;

export const NamespaceLink = ({ namespace, children, pill = false, showCluster = false, container = false }) => {
  const Tag = container ? LinkContainer : Link;
  const props = {
    to: `/namespaces/${namespace.id}`,
    ...container && { exact: true },
  };
  const text = `${showCluster ? `${namespace.cluster.name}/` : ''}${namespace.name}`;
  const element = pill ? <NamespacePill namespace={namespace} /> : (children || (<span>{text}</span>));

  return (
    <Tag {...props}>{element}</Tag>
  );
};

export const DeploymentLink = ({ deployment, icon, children }) => {
  const element = children || (<i className={`fa fa-${icon}`} aria-hidden='true'></i>);
  return (
    <Link to={`/deployments/${deployment.id}`}>{element}</Link>
  );
};

export const CreateDeploymentLink = (props) => {
  const {
    registry = {},
    service = {},
    version,
    namespace = {},
    secret = '',
    text,
    children,
    container,
  } = props;

  const tagProps = {
    to: {
      pathname: `/services/${registry.name}/${service.name}/deploy`,
      search: stringify({
        version,
        namespace: namespace.id || '',
        secret: secret,
      })
    },
    ...container && { exact: true },
  };
  const Tag = container ? LinkContainer : Link;
  const element = children || (<span>{text ? text : 'Deploy'}</span>);

  return (
    <Tag {...tagProps}>{element}</Tag>
  );
};

export const EditClusterLink = ({ cluster = {}, container, children}) => {
  const Tag = container ? LinkContainer : Link;
  const props = {
    to: `/admin/clusters/${cluster.id}/edit`,
    ...container && { exact: true }
  };

  return <Tag {...props}>{children || <span>Edit</span>}</Tag>;
};

export const EditNamespaceLink = ({ namespace = {}, container, namespaceId, children}) => {
  const Tag = container ? LinkContainer : Link;
  const props = {
    to: `/namespaces/${namespace.id || namespaceId}/edit`,
    ...container && { exact: true }
  };

  return <Tag {...props}>{children || <span>Edit</span>}</Tag>;
};

export const ManageNamespaceLink = ({ namespace = {}, container, namespaceId, children}) => {
  const Tag = container ? LinkContainer : Link;
  const props = {
    to: `/namespaces/${namespace.id || namespaceId}/manage`,
    ...container && { exact: true }
  };

  return <Tag {...props}>{children || <span>Manage</span>}</Tag>;
};

export const EditAccountLink = ({ account = {}, container, accountId, children }) => {
  const Tag = container ? LinkContainer : Link;
  const props = {
    to: `/accounts/${account.id || accountId}/edit`,
    ...container && { exact: true }
  };

  return <Tag {...props}>{children || <span>Edit</span>}</Tag>;
};

export const ServiceLink = ({ service, serviceName, registryName, children, container }) => {
  const Tag = container ? LinkContainer : Link;
  const props = {
    to: `/services/${registryName || (service && service.registry && service.registry.name)}/${serviceName || (service && service.name)}`,
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

export const ServiceSecretsForNamespaceLink = ({ namespace, registryName, serviceName, container, children }) => {
  const Tag = container ? LinkContainer : Link;
  const props = {
    to: `/services/${registryName}/${serviceName}/manage/secrets/${namespace.id}`,
    ...container && { exact: true }
  };

  return <Tag {...props}>{children || <span><i className="fa fa-key" aria-hidden='true'></i> Secrets</span>}</Tag>;
};

export const SecretVersionLink = ({ secretVersion, container, children }) => {
  const Tag = container ? LinkContainer : Link;
  const props = {
    to: `/services/secrets/view/${secretVersion.id}`,
    ...container && { exact: true }
  };

  return <Tag {...props}>{children || <span>View</span>}</Tag>;
};

export const NewSecretVersionLink = ({ namespace, registryName, serviceName, container, children }) => {
  const Tag = container ? LinkContainer : Link;
  const props = {
    to: `/services/${registryName}/${serviceName}/manage/secrets/${namespace.id}/new`,
    ...container && { exact: true }
  };

  return <Tag {...props}>{children || <span>New version</span>}</Tag>;
};

export const ServiceAttributesForNamespaceLink = ({ namespace, registryName, serviceName, container, children }) => {
  const Tag = container ? LinkContainer : Link;
  const props = {
    to: `/services/${registryName}/${serviceName}/manage/attributes/${namespace.id}`,
    ...container && { exact: true }
  };

  return <Tag {...props}>{children || <span><i className="fa fa-tags" aria-hidden='true'></i> Attributes</span>}</Tag>;
};

export const AccountMembershipLink = ({ account = {}, container, accountId, children }) => {
  const Tag = container ? LinkContainer : Link;
  const props = {
    to: `/accounts/${account.id || accountId}/teams`,
    ...container && { exact: true }
  };

  return <Tag {...props}>{children || <span><i className="fa fa-users" aria-hidden='true'></i> Team Membership</span>}</Tag>;
};

export const ServiceStatusLink = ({ registryName = '', serviceName = '', container, children }) => {
  const Tag = container ? LinkContainer : Link;
  const props = {
    to: `/services/${registryName}/${serviceName}/status`,
    ...container && { exact: true },
    isActive: (match, location) => (
      matchPath(location.pathname, { path: serviceStatus.route, exact: true })
      // "manual" because we optionally match on the namespace in the url as well
    ),
  };

  return <Tag {...props}>{children || <span>Status</span>}</Tag>;
};

export const AdminSummaryLink = ({ container, children }) => {
  const Tag = container ? LinkContainer : Link;
  const props = {
    to: '/admin',
    ...container && { exact: true }
  };

  return <Tag {...props}>{children || <span>Summary</span>}</Tag>;
};

export const AuditLink = ({ container, children }) => {
  const Tag = container ? LinkContainer : Link;
  const props = {
    to: '/admin/audit',
    ...container && { exact: true }
  };

  return <Tag {...props}>{children || <span>Audit</span>}</Tag>;
};

export const AdminRestoreLink = ({ container, children }) => {
  const Tag = container ? LinkContainer : Link;
  const props = {
    to: '/admin/restore',
    ...container && { exact: true }
  };

  return <Tag {...props}>{children || <span>Restore</span>}</Tag>;
};

export const AdminClustersLink = ({ container, children }) => {
  const Tag = container ? LinkContainer : Link;
  const props = {
    to: '/admin/clusters',
    ...container && { exact: true }
  };

  return <Tag {...props}>{children || <span>Clusters</span>}</Tag>;
};

export const AdminIngressLink = ({ container, children }) => {
  const Tag = container ? LinkContainer : Link;
  const props = {
    to: '/admin/ingress',
    ...container && { exact: true }
  };

  return <Tag {...props}>{children || <span>Ingress</span>}</Tag>;
};

export const IngressVersionsLink = ({ container, children, serviceName, registryName, versionId, qsPagination }) => {
  const Tag = container ? LinkContainer : Link;
  const props = {
    to: `/services/${registryName}/${serviceName}/ingress${versionId ? `/${versionId}` : ''}${qsPagination ? `?pagination=${qsPagination}` : ''}`,
    ...container && { exact: true },
  };

  if (container) props.isActive = (match, location) => (
    matchPath(location.pathname, { path: serviceIngress.route, exact: true })
    // "manual" because we optionally match on the version id in the url as well
  );

  return <Tag {...props}>{children || <span>Ingress</span>}</Tag>;
};

export const NewIngressVersionLink = ({ container, children, serviceName, registryName }) => {
  const Tag = container ? LinkContainer : Link;
  const props = {
    to: `/services/${registryName}/${serviceName}/ingress/new`,
    ...container && { exact: true }
  };

  return <Tag {...props}>{children || <span>New ingress version</span>}</Tag>;
};

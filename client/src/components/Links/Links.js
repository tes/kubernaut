import React from 'react';
import { Link, } from 'react-router-dom';

export const AccountLink = ({ account, }) => {
  // TODO Replace with Link when page availalbe
  return (
    <span>{account.displayName}</span>
  );
};

export const RegistryLink = ({ registry, }) => {
  // TODO Replace with Link when page availalbe
  return (
    <span>{registry.name}</span>
  );
};

export const NamespaceLink = ({ namespace, }) => {
  // TODO Replace with Link when page availalbe
  return (
    <span>{namespace.name}</span>
  );
};

export const ServiceLink = ({ service, }) => {
  // TODO Replace with Link when page availalbe
  return (
    <span>{service.name}</span>
  );
};

export const ReleaseLink = ({ release, }) => {
  // TODO Replace with Link when page availalbe
  return (
    <span>{release.version}</span>
  );
};

export const DeploymentLink = ({ deployment, icon, }) => {
  return (
    <Link to={`/deployments/${deployment.id}`}><i className={`fa fa-${icon}`} aria-hidden='true'></i></Link>
  );
};

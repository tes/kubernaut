import React from 'react';
import { Link, } from 'react-router-dom';

export const AccountLink = ({ account, }) => {
  return (
    <Link to={`/accounts/${account.id}`}>{account.displayName}</Link>
  );
};


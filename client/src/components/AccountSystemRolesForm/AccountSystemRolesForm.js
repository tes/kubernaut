import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import {
  Row,
  Col,
  Table,
} from 'reactstrap';
import Popover from '../Popover';

const helpSystem = {
  admin: {
    title: 'System \'admin\' role',
    body: 'Grants all system capabilities. For example: Alter registries, namespaces, clusters, accounts.',
  },
  maintainer: {
    title: 'System \'maintainer\' role',
    body: 'Grants management powers without full access to the system. This enables account management.',
  },
  developer: {
    title: 'System \'developer\' role',
    body: 'Grants typically required capabilities. At a system level this only adds the ability to observe cluster information compared to \'observer\' role.',
  },
  observer: {
    title: 'System \'observer\' role',
    body: 'Grants basic requirements to see data about accounts and access the ui.',
  },
};

const helpGlobal = {
  admin: {
    title: 'Global \'admin\' role',
    body: 'Grants all capabilities for all subjects. For example: admin powers over any namespace.',
  },
  maintainer: {
    title: 'Global \'maintainer\' role',
    body: 'Grants management powers for all subjects. For example: enables granting other accounts power over any namespace.',
  },
  developer: {
    title: 'Global \'developer\' role',
    body: 'Grants developer powers for all subjects. For example: deploying to any namespace.',
  },
  observer: {
    title: 'Global \'observer\' role',
    body: 'Grants the ability to read all subjects (namespaces/registries).',
  },
};

class AccountSystemRolesForm extends Component {
  render() {
    const {
      rolesGrantable,
      submitting,
      currentValues,
      updateGlobalRole,
      updateSystemRole,
      disableGlobals,
    } = this.props;

    return (
      <div>
        <form>
          <Row>
            <Col sm="8">
                <Table>
                  <thead>
                    <tr>
                      <th></th>
                      <th className="text-center">Admin</th>
                      <th className="text-center">Maintainer</th>
                      <th className="text-center">Developer</th>
                      <th className="text-center">Observer</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">System:</th>
                        {
                          ['admin', 'maintainer', 'developer', 'observer'].map((name) => (
                            <td key={name} className="text-center">
                              <Field
                                name={`${name}.system`}
                                component="input"
                                type="checkbox"
                                disabled={submitting || rolesGrantable.indexOf(name) < 0}
                                onChange={(event, newValue) => {
                                  updateSystemRole({
                                    role: name,
                                    newValue,
                                  });
                                }}
                              />
                            <label className="ml-1" htmlFor={`${name}.system`}><Popover {...helpSystem[name]} /></label>
                            </td>
                          ))
                        }
                    </tr>
                    <tr>
                      <th scope="row">Global:</th>
                        {
                          ['admin', 'maintainer', 'developer', 'observer'].map((name) => (
                            <td key={name} className="text-center">
                              <Field
                                name={`${name}.global`}
                                component="input"
                                type="checkbox"
                                disabled={
                                  submitting
                                  || disableGlobals
                                  || rolesGrantable.indexOf(name) < 0
                                  || !currentValues[name]
                                  || !currentValues[name].system
                                }
                                onChange={(event, newValue) => {
                                  updateGlobalRole({
                                    role: name,
                                    newValue,
                                  });
                                }}
                              />
                            <label className="ml-1" htmlFor={`${name}.system`}><Popover {...helpGlobal[name]} /></label>
                            </td>
                          ))
                        }
                    </tr>
                  </tbody>
                </Table>
            </Col>
          </Row>
        </form>
      </div>
    );
  }
}

AccountSystemRolesForm.propTypes = {
  rolesGrantable: PropTypes.array.isRequired,
  submitting: PropTypes.bool.isRequired,
  currentValues: PropTypes.object.isRequired,
  updateGlobalRole: PropTypes.func.isRequired,
  updateSystemRole: PropTypes.func.isRequired,
  disableGlobals: PropTypes.bool,
};

export default AccountSystemRolesForm;

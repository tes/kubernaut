import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field, FormSection } from 'redux-form';
import {
  Row,
  Col,
  Table,
  Button,
  FormGroup,
} from 'reactstrap';
import RenderSelect from '../RenderSelect';
import Popover from '../Popover';

const rolesDisplayMap = {
  'admin': 'Admin',
  'maintainer': 'Maintainer',
  'developer': 'Developer',
  'observer': 'Observer',
};

const help = {
  admin: {
    title: 'Registry \'admin\' role',
    body: 'Grants all actions for a registry.',
  },
  maintainer: {
    title: 'Registry \'maintainer\' role',
    body: 'Grants management capacity over a registry. This currently is only granting accounts visibility of a registry and services/releases bound to it.',
  },
  developer: {
    title: 'Registry \'developer\' role',
    body: 'Grants the ability to create releases/services against a registry.',
  },
  observer: {
    title: 'Registry \'observer\' role',
    body: 'Grants basic ability to see a registry and any services bound to it at all.',
  },
};

const roleForNewRegistryOptions = (roles) => roles.reduce((acc, role) =>
  (acc.concat({ value: role, display: rolesDisplayMap[role] })), []);


class Roles extends Component {
  render() {
    const {
      registry,
      currentValues = {},
      rolesGrantable,
      updateRolesForRegistry,
      deleteRolesForRegistry,
    } = this.props;
    const howManySet = Object.keys(currentValues).reduce((acc, role) => {
      return currentValues[role] ? acc + 1 : acc;
    }, 0);

    return (
      <tr>
        <th scope="row">{registry.name}</th>
        {
          ['admin', 'maintainer', 'developer', 'observer'].map((name) => (
            <td key={name} className="text-center">
              <Field
                name={name}
                component="input"
                type="checkbox"
                disabled={this.props.submitting || rolesGrantable.indexOf(name) < 0}
                onChange={(event, newValue) => {
                  if (!newValue && howManySet === 1) {
                    event.preventDefault();
                    return;
                  }
                  updateRolesForRegistry({
                    registryId: registry.id,
                    role: name,
                    newValue,
                  });
                }}
              />
            </td>
          ))
        }
        <td>
          <Button
            outline
            color="danger"
            onClick={() => {
              deleteRolesForRegistry({
                registryId: registry.id,
              });
            }}
            ><i className={`fa fa-trash`} aria-hidden='true'></i>
        </Button>
        </td>
      </tr>
    );
  }
}

class RegistriesRolesForm extends Component {
  render() {
    const {
      registriesPossibleToAdd,
      currentValues,
      currentRoles,
      rolesGrantable,
      submitting,
      updateRolesForRegistry,
      addNewRegistry,
      deleteRolesForRegistry,
    } = this.props;

    const registrySelectOptions = registriesPossibleToAdd.map((registry) => ({
      value: registry.id,
      display: `${registry.name}`,
    }));

    const newRegistryRoleOptions = currentValues.newRegistry ?
      roleForNewRegistryOptions(rolesGrantable.find(({ id }) => id === currentValues.newRegistry).roles)
      : [];

    return (
      <div>
        <form>
          <Row>
            <Col sm="9">
                <Table>
                  <thead>
                    <tr>
                      <th></th>
                      <th className="text-center">Admin <Popover {...help['admin']} classNames="d-inline"/></th>
                      <th className="text-center">Maintainer <Popover {...help['maintainer']} classNames="d-inline"/></th>
                      <th className="text-center">Developer <Popover {...help['developer']} classNames="d-inline"/></th>
                      <th className="text-center">Observer <Popover {...help['observer']} classNames="d-inline"/></th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      currentRoles.map(({ registry }) => {
                        const grantableForRegistry = rolesGrantable.find(({ id }) => id === registry.id);
                        const rolesGrantableForRegistry = grantableForRegistry ? grantableForRegistry.roles : [];
                        return <FormSection name={registry.id} key={registry.id}>
                          <Roles
                            registry={registry}
                            currentValues={currentValues[registry.id]}
                            updateRolesForRegistry={updateRolesForRegistry}
                            deleteRolesForRegistry={deleteRolesForRegistry}
                            submitting={submitting}
                            rolesGrantable={rolesGrantableForRegistry}
                            />
                        </FormSection>;
                      })
                    }
                  </tbody>
                </Table>
            </Col>
          </Row>
          <Row>
            <Col md="12">
              <h6>Add a registry:</h6>
              <FormGroup>
                <Row>
                  <Col sm="4">
                    <Field
                      name="newRegistry"
                      className="form-control"
                      component={RenderSelect}
                      options={registrySelectOptions}
                    />
                  </Col>
                  <Col sm="4">
                    <Field
                      name="roleForNewRegistry"
                      className="form-control"
                      component={RenderSelect}
                      options={newRegistryRoleOptions}
                      disabled={!currentValues.newRegistry}
                    />
                  </Col>
                  <Col sm="1">
                    <Button
                      color="light"
                      disabled={!(currentValues.newRegistry && currentValues.roleForNewRegistry)}
                      onClick={() => {
                        addNewRegistry();
                      }}
                    >Add</Button>
                  </Col>
                </Row>
              </FormGroup>
            </Col>
          </Row>
        </form>
      </div>
    );
  }
}

RegistriesRolesForm.propTypes = {
  currentValues: PropTypes.object.isRequired,
  registriesPossibleToAdd: PropTypes.array.isRequired,
  rolesGrantable: PropTypes.array.isRequired,
  currentRoles: PropTypes.array.isRequired,
  submitting: PropTypes.bool.isRequired,
  updateRolesForRegistry: PropTypes.func.isRequired,
  addNewRegistry: PropTypes.func.isRequired,
  deleteRolesForRegistry: PropTypes.func.isRequired,
};

export default RegistriesRolesForm;

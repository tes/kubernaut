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
import { NamespaceLink } from '../Links';

const rolesDisplayMap = {
  'admin': 'Admin',
  'maintainer': 'Maintainer',
  'developer': 'Developer',
  'observer': 'Observer',
};

const help = {
  admin: {
    title: 'Namespace \'admin\' role',
    body: 'Grants all actions for a namespace.',
  },
  maintainer: {
    title: 'Namespace \'maintainer\' role',
    body: 'Grants management capacity over a namespace. This includes granting services/accounts access to the namespace, as well as managing secrets.',
  },
  developer: {
    title: 'Namespace \'developer\' role',
    body: 'Grants the ability to deploy to a namespace.',
  },
  observer: {
    title: 'Namespace \'observer\' role',
    body: 'Grants basic ability to see a namespace and any deployments to it at all.',
  },
};

const roleForNewNamespaceOptions = (roles) => roles.reduce((acc, role) =>
  (acc.concat({ value: role, display: rolesDisplayMap[role] })), []);

class Roles extends Component {
  render() {
    const {
      namespace,
      currentValues = {},
      updateRolesForNamespace,
      deleteRolesForNamespace,
      rolesGrantable,
    } = this.props;
    const howManySet = Object.keys(currentValues).reduce((acc, role) => {
      return currentValues[role] ? acc + 1 : acc;
    }, 0);

    return (
      <tr>
        <th scope="row">{namespace.cluster.name}/{namespace.name}</th>
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
                  updateRolesForNamespace({
                    namespaceId: namespace.id,
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
              deleteRolesForNamespace({
                namespaceId: namespace.id,
              });
            }}
            ><i className={`fa fa-trash`} aria-hidden='true'></i>
        </Button>
        </td>
      </tr>
    );
  }
}

class NamespacesRolesForm extends Component {
  render() {
    const {
      namespacesPossibleToAdd,
      currentValues,
      currentRoles,
      rolesGrantable,
      submitting,
      updateRolesForNamespace,
      addNewNamespace,
      deleteRolesForNamespace,
      suggestedNamespaces = [],
    } = this.props;

    const namespaceSelectOptions = namespacesPossibleToAdd.map((namespace) => ({
      value: namespace.id,
      display: `${namespace.cluster.name}/${namespace.name}`,
    }));

    const newNamespaceRoleOptions = currentValues.newNamespace ?
      roleForNewNamespaceOptions(rolesGrantable.find(({ id }) => id === currentValues.newNamespace).roles)
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
                      currentRoles.map(({ namespace }) => {
                        const grantableForNamespace = rolesGrantable.find(({ id }) => id === namespace.id);
                        const rolesGrantableForNamespace = grantableForNamespace ? grantableForNamespace.roles : [];
                        return <FormSection name={namespace.id} key={namespace.id}>
                          <Roles
                            namespace={namespace}
                            currentValues={currentValues[namespace.id]}
                            updateRolesForNamespace={updateRolesForNamespace}
                            deleteRolesForNamespace={deleteRolesForNamespace}
                            submitting={submitting}
                            rolesGrantable={rolesGrantableForNamespace}
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
              <h6>Add a namespace:</h6>
              <FormGroup>
                <Row>
                  <Col sm="4">
                    <Field
                      name="newNamespace"
                      className="form-control"
                      component={RenderSelect}
                      options={namespaceSelectOptions}
                    />
                  </Col>
                  <Col sm="4">
                    <Field
                      name="roleForNewNamespace"
                      className="form-control"
                      component={RenderSelect}
                      options={newNamespaceRoleOptions}
                      disabled={!currentValues.newNamespace}
                    />
                  </Col>
                  <Col sm="1">
                    <Button
                      color="light"
                      disabled={!(currentValues.newNamespace && currentValues.roleForNewNamespace)}
                      onClick={() => {
                        addNewNamespace();
                      }}
                    >Add</Button>
                  </Col>
                </Row>
              </FormGroup>
            </Col>
          </Row>
          { suggestedNamespaces.length ? <Row>
            <Col md="9">
              <Row>
                <Col>
                  <h6>This team has services which deploy to the following namespaces, you may wish to add at least 'Developer' permissions to enable team members to deploy those services to:</h6>
                </Col>
              </Row>
              <Row>
                <Col className="d-inline-flex">
                  {suggestedNamespaces.map((n) => (
                    <div className="mr-2" key={n.id}>
                      <NamespaceLink namespace={n} pill showCluster/>
                    </div>
                  ))}
                </Col>
              </Row>
            </Col>
          </Row> : null }
        </form>
      </div>
    );
  }
}

NamespacesRolesForm.propTypes = {
  currentValues: PropTypes.object.isRequired,
  namespacesPossibleToAdd: PropTypes.array.isRequired,
  rolesGrantable: PropTypes.array.isRequired,
  currentRoles: PropTypes.array.isRequired,
  submitting: PropTypes.bool.isRequired,
  updateRolesForNamespace: PropTypes.func.isRequired,
  deleteRolesForNamespace: PropTypes.func.isRequired,
  addNewNamespace: PropTypes.func.isRequired,
  suggestedNamespaces: PropTypes.array,
};

export default NamespacesRolesForm;

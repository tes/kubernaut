import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { sortBy as _sortBy } from 'lodash';
import { Field, FormSection } from 'redux-form';
import {
  Row,
  Col,
  Table,
  Button,
  FormGroup,
} from 'reactstrap';
import RenderSelect from '../RenderSelect';

const roleForNewNamespaceOptions = [
  { value: 'admin', display: 'Admin' },
  { value: 'maintainer', display: 'Maintainer' },
  { value: 'developer', display: 'Developer' },
  { value: 'observer', display: 'Observer' },
];

class Roles extends Component {
  render() {
    const {
      namespace,
      currentValues = {},
      updateRolesForNamespace,
      deleteRolesForNamespace,
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
                disabled={this.props.submitting}
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

class AccountNamespacesRolesForm extends Component {
  render() {
    const {
      namespacesPossibleToAdd,
      namespaceData,
      currentValues,
      submitting,
      fieldNamespaceIds,
      updateRolesForNamespace,
      addNewNamespace,
      deleteRolesForNamespace,
    } = this.props;

    const namespaceSelectOptions = namespacesPossibleToAdd.map((id) => {
      const namespace = namespaceData.items.find(({ id: nId }) => (nId === id));
      return {
        value: id,
        display: `${namespace.cluster.name}/${namespace.name}`,
      };
    });

    const namespacesForFields = _sortBy(namespaceData.items
      .filter(({ id }) => fieldNamespaceIds.indexOf(id) > -1),
      ['cluster.name', 'name']);

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
                    {
                      namespacesForFields.map((namespace) => (
                        <FormSection name={namespace.id} key={namespace.id}>
                          <Roles
                            namespace={namespace}
                            currentValues={currentValues[namespace.id]}
                            updateRolesForNamespace={updateRolesForNamespace}
                            deleteRolesForNamespace={deleteRolesForNamespace}
                            submitting={submitting}
                          />
                        </FormSection>
                      ))
                    }
                  </tbody>
                </Table>
            </Col>
          </Row>
          <Row>
            <h6>Add a namespace:</h6>
            <Col md="12">
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
                      options={roleForNewNamespaceOptions}
                    />
                  </Col>
                  <Col sm="1">
                    <Button
                      outline
                      color="secondary"
                      onClick={() => {
                        addNewNamespace();
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

AccountNamespacesRolesForm.propTypes = {
  currentValues: PropTypes.object.isRequired,
  fieldNamespaceIds: PropTypes.array.isRequired,
  namespaceData: PropTypes.object.isRequired,
  namespacesPossibleToAdd: PropTypes.array.isRequired,
};

export default AccountNamespacesRolesForm;

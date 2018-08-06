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

const roleForNewRegistryOptions = [
  { value: 'admin', display: 'Admin' },
  { value: 'maintainer', display: 'Maintainer' },
  { value: 'developer', display: 'Developer' },
  { value: 'observer', display: 'Observer' },
];

class Roles extends Component {
  render() {
    const {
      registry,
      currentValues = {},
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
                disabled={this.props.submitting}
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

class AccountRegistriesRolesForm extends Component {
  render() {
    const {
      registriesPossibleToAdd,
      registryData,
      currentValues,
      submitting,
      fieldRegistryIds,
      updateRolesForRegistry,
      addNewRegistry,
      deleteRolesForRegistry,
    } = this.props;

    const registrySelectOptions = registriesPossibleToAdd.map((id) => {
      const registry = registryData.items.find(({ id: rId }) => (rId === id));
      return {
        value: id,
        display: `${registry.name}`,
      };
    });

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
                      fieldRegistryIds.map((registryId) => (
                        <FormSection name={registryId} key={registryId}>
                          <Roles
                            registry={registryData.items.find(({ id }) => (id === registryId))}
                            currentValues={currentValues[registryId]}
                            updateRolesForRegistry={updateRolesForRegistry}
                            deleteRolesForRegistry={deleteRolesForRegistry}
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
            <h6>Add a registry:</h6>
            <Col md="12">
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
                      options={roleForNewRegistryOptions}
                    />
                  </Col>
                  <Col sm="1">
                    <Button
                      outline
                      color="secondary"
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

AccountRegistriesRolesForm.propTypes = {
  currentValues: PropTypes.object.isRequired,
  fieldRegistryIds: PropTypes.array.isRequired,
  registryData: PropTypes.object.isRequired,
  registriesPossibleToAdd: PropTypes.array.isRequired,
};

export default AccountRegistriesRolesForm;

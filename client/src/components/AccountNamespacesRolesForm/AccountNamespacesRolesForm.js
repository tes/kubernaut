import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field, FormSection } from 'redux-form';
import {
  Row,
  Col,
  Table,
} from 'reactstrap';

class Roles extends Component {
  render() {
    const { namespace, currentValues = {}, updateRolesForNamespace } = this.props;
    const howManySet = Object.keys(currentValues).reduce((acc, role) => {
      return currentValues[role] ? acc + 1 : acc;
    }, 0);

    return (
      <tr>
        <th scope="row">{namespace.cluster.name}/{namespace.name}</th>
        {
          ['admin', 'maintainer', 'developer', 'observer'].map((name) => (
            <td key={name}>
              <Field
                name={name}
                component="input"
                type="checkbox"
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
      </tr>
    );
  }
}

class AccountNamespacesRolesForm extends Component {
  render() {
    //const error = this.props.error;

    return (
      <div>
        <Row>
          <Col sm="8">
            <form>
              <Table>
                <thead>
                  <tr>
                    <th></th>
                    <th>Admin</th>
                    <th>Maintainer</th>
                    <th>Developer</th>
                    <th>Observer</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    this.props.namespaceIds.map((namespaceId) => (
                      <FormSection name={namespaceId} key={namespaceId}>
                        <Roles
                          namespace={this.props.namespaceData.items.find(({ id }) => (id === namespaceId))}
                          currentValues={this.props.currentValues[namespaceId]}
                          updateRolesForNamespace={this.props.updateRolesForNamespace}
                        />
                      </FormSection>
                    ))
                  }
                </tbody>
              </Table>
            </form>
          </Col>
        </Row>
      </div>
    );
  }
}

AccountNamespacesRolesForm.propTypes = {
  currentValues: PropTypes.object.isRequired,
  namespaceIds: PropTypes.array.isRequired,
  namespaceData: PropTypes.object.isRequired,
};

export default AccountNamespacesRolesForm;

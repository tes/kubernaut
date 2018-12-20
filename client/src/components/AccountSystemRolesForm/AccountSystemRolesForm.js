import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import {
  Row,
  Col,
  Table,
} from 'reactstrap';

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

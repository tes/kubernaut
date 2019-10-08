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
    title: 'Team \'admin\' role',
    body: 'Grants all actions for a team. (no different to maintainer)',
  },
  maintainer: {
    title: 'Team \'maintainer\' role',
    body: 'Grants management capacity over a team.',
  },
  developer: {
    title: 'Team \'developer\' role',
    body: 'Grants no different to observer',
  },
  observer: {
    title: 'Team \'observer\' role',
    body: 'Grants basic ability to see a team.',
  },
};

const roleForNewTeamOptions = (roles) => roles.reduce((acc, role) =>
  (acc.concat({ value: role, display: rolesDisplayMap[role] })), []);

class Roles extends Component {
  render() {
    const {
      team,
      currentValues = {},
      updateRolesForTeam,
      deleteRolesForTeam,
      rolesGrantable,
    } = this.props;
    const howManySet = Object.keys(currentValues).reduce((acc, role) => {
      return currentValues[role] ? acc + 1 : acc;
    }, 0);

    return (
      <tr>
        <th scope="row">{team.name}</th>
        {
          [null, 'maintainer', null,'observer'].map((name) => {
            if (!name) return (<td></td>);
            return (<td key={name} className="text-center">
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
                  updateRolesForTeam({
                    teamId: team.id,
                    role: name,
                    newValue,
                  });
                }}
              />
            </td>);
          })
        }
        <td>
          <Button
            outline
            color="danger"
            onClick={() => {
              deleteRolesForTeam({
                teamId: team.id,
              });
            }}
            ><i className={`fa fa-trash`} aria-hidden='true'></i>
        </Button>
        </td>
      </tr>
    );
  }
}

class AccountTeamsRolesForm extends Component {
  render() {
    const {
      teamsPossibleToAdd,
      currentValues,
      currentRoles,
      rolesGrantable,
      submitting,
      updateRolesForTeam,
      addNewTeam,
      deleteRolesForTeam,
    } = this.props;

    const teamSelectOptions = teamsPossibleToAdd.map((team) => ({
      value: team.id,
      display: team.name,
    }));

    const newTeamRoleOptions = currentValues.newTeam ?
      roleForNewTeamOptions(rolesGrantable.find(({ id }) => id === currentValues.newTeam).roles)
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
                      <th className="text-center"></th>
                      <th className="text-center">Maintainer <Popover {...help['maintainer']} classNames="d-inline"/></th>
                      <th className="text-center"></th>
                      <th className="text-center">Observer <Popover {...help['observer']} classNames="d-inline"/></th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      currentRoles.map(({ team }) => {
                        const grantableForTeam = rolesGrantable.find(({ id }) => id === team.id);
                        const rolesGrantableForTeam = grantableForTeam ? grantableForTeam.roles : [];
                        return <FormSection name={team.id} key={team.id}>
                          <Roles
                            team={team}
                            currentValues={currentValues[team.id]}
                            updateRolesForTeam={updateRolesForTeam}
                            deleteRolesForTeam={deleteRolesForTeam}
                            submitting={submitting}
                            rolesGrantable={rolesGrantableForTeam}
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
              <h6>Add a team:</h6>
              <FormGroup>
                <Row>
                  <Col sm="4">
                    <Field
                      name="newTeam"
                      className="form-control"
                      component={RenderSelect}
                      options={teamSelectOptions}
                    />
                  </Col>
                  <Col sm="4">
                    <Field
                      name="roleForNewTeam"
                      className="form-control"
                      component={RenderSelect}
                      options={newTeamRoleOptions}
                      disabled={!currentValues.newTeam}
                    />
                  </Col>
                  <Col sm="1">
                    <Button
                      color="light"
                      disabled={!(currentValues.newTeam && currentValues.roleForNewTeam)}
                      onClick={() => {
                        addNewTeam();
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

AccountTeamsRolesForm.propTypes = {
  currentValues: PropTypes.object.isRequired,
  teamsPossibleToAdd: PropTypes.array.isRequired,
  rolesGrantable: PropTypes.array.isRequired,
};

export default AccountTeamsRolesForm;

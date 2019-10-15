import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import {
  Row,
  Col,
  FormGroup,
  Label,
  Button,
  Progress,
  Form,
} from 'reactstrap';
import Title from '../Title';
import { AccountsSubNav } from '../SubNavs';
import RenderSelect from '../RenderSelect';
import {
  TeamLink,
} from '../Links';

class AccountTeamPage extends Component {

  render() {
    const {
      meta,
      account,
      teamMembership,
      currentValues,
      addMembership,
      removeMembership,
    } = this.props;
    if (meta.loading.loadingPercent !== 100) return (
      <Row className="page-frame d-flex justify-content-center">
        <Col sm="12" className="mt-5">
          <Progress animated color="info" value={meta.loading.loadingPercent} />
        </Col>
      </Row>
    );

    if (!this.props.canManageTeam) {
      return (
        <Row className="page-frame">
          <Col xs="12">
            <p>You are not authorised to view this page.</p>
          </Col>
        </Row>
      );
    }

    const newMembershipOptions = teamMembership.noMembership.map(t => ({
      value: t.id,
      display: t.name,
    }));

    return (
      <Row className="page-frame">
        <Col>
          <Title title={`Edit account: ${account.displayName}`} />
          <AccountsSubNav account={account} canEdit={this.props.canEdit} canManageTeam={this.props.canManageTeam} />

          <Row>
            <Col>
              <Form>
                <Row>
                  <Col>
                    <h5>Current membership:</h5>
                  </Col>
                </Row>
                {
                  teamMembership.currentMembership.map(t => (
                    <Row form key={t.id}>
                      <Col md="6">
                        <FormGroup className="row">
                          <Label for={t.id} className="col-sm-4 col-form-label"><TeamLink team={t} /></Label>
                          <Button
                            outline
                            color="danger"
                            onClick={() => removeMembership({ team: t.id })}
                            ><i className={`fa fa-trash`} aria-hidden='true'></i>
                          </Button>
                        </FormGroup>
                      </Col>
                    </Row>
                  ))
                }
                <Row>
                  <Col>
                    <h6>Add membership:</h6>
                    <FormGroup>
                      <Row>
                        <Col sm="4">
                          <Field
                            name="newMembership"
                            className="form-control"
                            component={RenderSelect}
                            options={newMembershipOptions}
                          />
                        </Col>
                        <Col sm="1">
                          <Button
                            color="light"
                            disabled={!(currentValues.newMembership)}
                            onClick={() => {
                              addMembership();
                            }}
                          >Add</Button>
                        </Col>
                      </Row>
                    </FormGroup>
                  </Col>
                </Row>
              </Form>
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }
}

AccountTeamPage.propTypes = {
  accountId: PropTypes.string.isRequired,
  account: PropTypes.object.isRequired,
  meta: PropTypes.object.isRequired,
};

export default AccountTeamPage;

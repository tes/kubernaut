import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field, FormSection } from 'redux-form';
import {
  Row,
  Col,
  Button,
  Form,
  Label,
  FormGroup,
  Table,
  Card,
  CardHeader,
  CardBody,
} from 'reactstrap';
import TablePagination from '../TablePagination';
import RenderInput from '../RenderInput';
import { AdminSubNav } from '../SubNavs';
import Title from '../Title';

class AdminClustersPage extends Component {

  render() {
    const {
      canAudit,
      hasClustersWrite,
      hasIngressAdminWrite,
      fetchHostKeysPagination,
      fetchVariableKeysPagination,
      fetchClassesPagination,
      handleSubmit,
      submitHostForm,
      submitVariableForm,
      submitClassForm,
      hosts,
      variables,
      classes,
    } = this.props;

    return (
      <Row className="page-frame">
        <Col>
          <Title title="Ingress" />
          <AdminSubNav canAudit={canAudit} hasClustersWrite={hasClustersWrite} hasIngressAdminWrite={hasIngressAdminWrite} />

          <Row className="mb-2">
            <Col>
            </Col>
          </Row>
          <Form>
            <Row className="mb-2">
              <Col>
                <Card>
                  <CardHeader><span>Host keys:</span></CardHeader>
                  <CardBody>
                    <Row>
                      <Col>
                        <Table hover size="sm">
                          <thead>
                            <tr>
                              <th>Name</th>
                            </tr>
                          </thead>
                          <tbody>
                            {
                              hosts.items.map(c => (
                                <tr key={c.id}>
                                  <td>
                                    {c.name}
                                  </td>
                                </tr>
                              ))
                            }
                          </tbody>
                        </Table>
                        <TablePagination
                          pages={hosts.pages}
                          page={hosts.page}
                          limit={hosts.limit}
                          fetchContent={fetchHostKeysPagination}
                          />
                      </Col>
                      <Col>
                        <Card>
                          <CardBody>
                            <FormSection name="newHost">
                              <h6>New host key:</h6>
                              <FormGroup row>
                                <Label sm="3" className="text-right" for="name">Name:</Label>
                                <Col sm="9">
                                  <Field
                                    className="form-control"
                                    name="name"
                                    component={RenderInput}
                                    type="text"
                                    autoComplete="off"
                                  />
                                </Col>
                              </FormGroup>
                              <FormGroup row>
                                <Col>
                                  <Button
                                    className="pull-right"
                                    color="dark"
                                    onClick={handleSubmit(submitHostForm)}
                                    >Add</Button>
                                </Col>
                              </FormGroup>
                            </FormSection>
                          </CardBody>
                        </Card>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
              </Col>
            </Row>
            <Row className="mb-2">
              <Col>
                <Card>
                  <CardHeader><span>Variable keys:</span></CardHeader>
                  <CardBody>
                    <Row>
                      <Col>
                        <Table hover size="sm">
                          <thead>
                            <tr>
                              <th>Name</th>
                            </tr>
                          </thead>
                          <tbody>
                            {
                              variables.items.map(c => (
                                <tr key={c.id}>
                                  <td>
                                    {c.name}
                                  </td>
                                </tr>
                              ))
                            }
                          </tbody>
                        </Table>
                        <TablePagination
                          pages={variables.pages}
                          page={variables.page}
                          limit={variables.limit}
                          fetchContent={fetchVariableKeysPagination}
                        />
                      </Col>
                      <Col>
                        <Card>
                          <CardBody>
                            <FormSection name="newVariable">
                              <h6>New variable key:</h6>
                              <FormGroup row>
                                <Label sm="3" className="text-right" for="name">Name:</Label>
                                <Col sm="9">
                                  <Field
                                    className="form-control"
                                    name="name"
                                    component={RenderInput}
                                    type="text"
                                    autoComplete="off"
                                  />
                                </Col>
                              </FormGroup>
                              <FormGroup row>
                                <Col>
                                  <Button
                                    className="pull-right"
                                    color="dark"
                                    onClick={handleSubmit(submitVariableForm)}
                                    >Add</Button>
                                </Col>
                              </FormGroup>
                            </FormSection>
                          </CardBody>
                        </Card>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
              </Col>
            </Row>
            <Row className="mb-2">
              <Col>
                <Card>
                  <CardHeader><span>Ingress classes:</span></CardHeader>
                  <CardBody>
                    <Row>
                      <Col>
                        <Table hover size="sm">
                          <thead>
                            <tr>
                              <th>Name</th>
                            </tr>
                          </thead>
                          <tbody>
                            {
                              classes.items.map(c => (
                                <tr key={c.id}>
                                  <td>
                                    {c.name}
                                  </td>
                                </tr>
                              ))
                            }
                          </tbody>
                        </Table>
                        <TablePagination
                          pages={variables.pages}
                          page={variables.page}
                          limit={variables.limit}
                          fetchContent={fetchClassesPagination}
                        />
                      </Col>
                      <Col>
                        <Card>
                          <CardBody>
                            <FormSection name="newClass">
                              <h6>New ingress class:</h6>
                              <FormGroup row>
                                <Label sm="3" className="text-right" for="name">Name:</Label>
                                <Col sm="9">
                                  <Field
                                    className="form-control"
                                    name="name"
                                    component={RenderInput}
                                    type="text"
                                    autoComplete="off"
                                  />
                                </Col>
                              </FormGroup>
                              <FormGroup row>
                                <Col>
                                  <Button
                                    className="pull-right"
                                    color="dark"
                                    onClick={handleSubmit(submitClassForm)}
                                    >Add</Button>
                                </Col>
                              </FormGroup>
                            </FormSection>
                          </CardBody>
                        </Card>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>
    );
  }
}

AdminClustersPage.propTypes = {
  hosts: PropTypes.object,
  variables: PropTypes.object,
};

export default AdminClustersPage;

import React, { Component } from 'react';
import { Field } from 'redux-form';
import {
  Row,
  Col,
  Card,
  CardBody,
  Form,
  Label,
  FormGroup,
  Table,
  Button,
} from 'reactstrap';
import { AdminSubNav } from '../SubNavs';
import TablePagination from '../TablePagination';
import RenderSelect from '../RenderSelect';

class AdminRestorePage extends Component {

  render() {
    const { canAudit, deleted, hasClustersWrite } = this.props;
    const restoreSelectValues = [
      { value: 'account', display: 'Account' },
      { value: 'cluster', display: 'Cluster' },
      { value: 'job', display: 'CronJob' },
      { value: 'namespace', display: 'Namespace' },
      { value: 'service', display: 'Service' },
      { value: 'team', display: 'Team' },
    ];

    return (
      <Row className='page-frame'>
        <Col md className="mb-2">
          <AdminSubNav canAudit={canAudit} hasClustersWrite={hasClustersWrite} />

          <Row>
            <Col>
              <Card>
                <CardBody>
                  <Row>
                    <Col>
                      <Form>
                        <FormGroup row>
                          <Label sm="3" className="text-right" for="type">Type:</Label>
                          <Col sm="3">
                            <Field
                              className="form-control"
                              name="type"
                              component={RenderSelect}
                              autoComplete="off"
                              options={restoreSelectValues}
                              onChangeListener={() => this.props.changeType()}
                              />
                          </Col>
                        </FormGroup>
                      </Form>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm="1"></Col>
                    <Col>
                      <Table hover size="sm">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {
                            deleted.data.items.map(d => (
                              <tr key={d.id}>
                                <td style={{width: '100%'}}>{d.name || d.displayName}</td>
                                <td>
                                  <Button
                                    color="dark"
                                    onClick={() => this.props.restore(d.id)}
                                  >Restore</Button>
                                </td>
                              </tr>
                            ))
                          }
                        </tbody>
                      </Table>
                      <TablePagination
                        pages={deleted.data.pages}
                        page={deleted.data.page}
                        limit={deleted.data.limit}
                        fetchContent={this.props.fetchDeletedPagination}
                      />
                    </Col>
                    <Col sm="1"></Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }
}

export default AdminRestorePage;

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import {
  Row,
  Col,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Form,
  Label,
  FormGroup,
  Table,
  Badge,
} from 'reactstrap';
import TablePagination from '../TablePagination';
import RenderInput from '../RenderInput';
import { AdminSubNav } from '../SubNavs';
import {
  ClusterLink,
  EditClusterLink,
} from '../Links';

class AdminClustersPage extends Component {

  render() {
    const {
      canAudit,
      hasClustersWrite,
      clusters,
      fetchClustersPagination,
      openModal,
      closeModal,
      newModalOpen,
      handleSubmit,
      submitForm,
      error,
    } = this.props;

    return (
      <Row className="page-frame">
        <Col>
          <AdminSubNav canAudit={canAudit} hasClustersWrite={hasClustersWrite} />

          <Row>
            <Col>
            </Col>
          </Row>
          <Row>
            <Col md="6">
              <Table hover size="sm">
                <thead>
                  <tr>
                    <th></th>
                    <th>Name</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {
                    clusters.data.items.map(c => (
                      <tr key={c.id}>
                        <td>
                          <Badge
                            style={{
                              backgroundColor: c.color
                            }}
                            pill
                          >&nbsp;</Badge>
                        </td>
                        <td style={{width: '100%'}}><ClusterLink cluster={c} /></td>
                        <td>
                          <EditClusterLink cluster={c} />
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </Table>
              <TablePagination
                pages={clusters.data.pages}
                page={clusters.data.page}
                limit={clusters.data.limit}
                fetchContent={fetchClustersPagination}
              />
            </Col>
            <Col md="3"></Col>
            <Col>
              {
                hasClustersWrite ? (
                  <Button
                    color="dark"
                    onClick={() => openModal()}
                    >Add new cluster</Button>
                ): null
              }
            </Col>
          </Row>
          <Modal
            isOpen={newModalOpen}
            toggle={closeModal}
            size="lg"
            >
            <ModalHeader>
              <span>Add a new cluster</span>
            </ModalHeader>
            <ModalBody>
              <Row>
                <Col>
                  <Form>
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
                      <Label sm="3" className="text-right" for="config">Config:</Label>
                      <Col sm="9">
                        <Field
                          className="form-control"
                          name="config"
                          component={RenderInput}
                          type="text"
                          autoComplete="off"
                        />
                      </Col>
                    </FormGroup>
                    <FormGroup row>
                      <Label sm="3" className="text-right" for="context">Context:</Label>
                      <Col sm="9">
                        <Field
                          className="form-control"
                          name="context"
                          component={RenderInput}
                          type="text"
                          autoComplete="off"
                        />
                      </Col>
                    </FormGroup>
                    <FormGroup row>
                      <Label sm="3" className="text-right" for="color">Color:</Label>
                      <Col sm="9">
                        <Field
                          className="form-control"
                          name="color"
                          component={RenderInput}
                          type="text"
                          autoComplete="off"
                        />
                      </Col>
                    </FormGroup>
                    <FormGroup row>
                      <Label sm="3" className="text-right" for="priority">Priority:</Label>
                      <Col sm="9">
                        <Field
                          className="form-control"
                          name="priority"
                          component={RenderInput}
                          type="text"
                          autoComplete="off"
                        />
                      </Col>
                    </FormGroup>
                    <FormGroup row>
                      <Col>
                        {error && <span className="help-block"><span className="text-danger">{error}</span></span>}
                      </Col>
                    </FormGroup>
                    <FormGroup row>
                      <Col>
                        <Button
                          className="pull-right"
                          color="dark"
                          onClick={handleSubmit(submitForm)}
                          >Create</Button>
                      </Col>
                    </FormGroup>
                  </Form>
                </Col>
              </Row>
            </ModalBody>
          </Modal>
        </Col>
      </Row>
    );
  }
}

AdminClustersPage.propTypes = {
  clusters: PropTypes.object,
};

export default AdminClustersPage;

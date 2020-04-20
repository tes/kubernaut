import React, { Component } from 'react';
import { Field } from 'redux-form';
import PropTypes from 'prop-types';
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
} from 'reactstrap';
import JobsTable from '../JobsTable';
import RenderInput from '../RenderInput';
import RenderNamespaces from '../RenderNamespaces';

class TeamsPage extends Component {

  render() {
    const { jobs, fetchJobsPagination } = this.props;

    return (
      <div className='page-frame'>
        <Row>
          <Col md="8">
            <JobsTable jobs={jobs.data} loading={jobs.meta.loading} error={jobs.meta.error} fetchJobs={fetchJobsPagination} />
          </Col>
          <Col>
            {
              this.props.canCreate ? (
                <Button
                  color="dark"
                  onClick={() => this.props.openModal()}
                  >Create new job</Button>
              ): null
            }
          </Col>
        </Row>
        <Modal
          isOpen={this.props.newModalOpen}
          toggle={this.props.closeModal}
          size="lg"
        >
          <ModalHeader>
            <span>Create a new job</span>
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
                    <Label sm="3" className="text-right" for="namespace">Cluster/Namespace:</Label>
                    <Col sm="9">
                      <Field
                        className=""
                        name="namespace"
                        component={RenderNamespaces}
                        autoComplete="off"
                        options={this.props.namespaces.items}
                        />
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Col>
                      <Button
                        className="pull-right"
                        color="dark"
                        onClick={this.props.handleSubmit(this.props.submitForm)}
                      >Create</Button>
                    </Col>
                  </FormGroup>
                </Form>
              </Col>
            </Row>
          </ModalBody>
        </Modal>
      </div>
    );
  }
}

TeamsPage.propTypes = {
  jobs: PropTypes.object,
};

export default TeamsPage;

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
import RenderSelect from '../RenderSelect';
import RenderNamespaces from '../RenderNamespaces';
import TableFilter from '../TableFilter';

const validName = /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/;

class JobsPage extends Component {

  render() {
    const {
      jobs,
      newModalOpen,
      canCreate,
      namespaces,
      registries,
      submitForm,
      fetchJobsPagination,
      openModal,
      closeModal,
      handleSubmit,
      addFilter,
      removeFilter,
      search,
      clearSearch,
      showFilters,
      hideFilters,
    } = this.props;

    return (
      <Row className='page-frame'>
        <Col>
          <Row>
            <Col>
              <TableFilter
                formPrefix="jobs"
                statePath="jobs.filter"
                columns={[
                  { value: 'name', display: 'Name' },
                  { value: 'cluster', display: 'Cluster' },
                  { value: 'namespace', display: 'Namespace' },
                ]}
                addFilter={addFilter}
                removeFilter={removeFilter}
                search={search}
                clearSearch={clearSearch}
                showFilters={showFilters}
                hideFilters={hideFilters}
                />
            </Col>
          </Row>
          <Row>
            <Col md="9">
              <JobsTable jobs={jobs.data} loading={jobs.meta.loading} error={jobs.meta.error} fetchJobs={fetchJobsPagination} addFilter={addFilter} />
            </Col>
            <Col>
              {
                canCreate ? (
                  <Button
                    color="dark"
                    onClick={() => openModal()}
                    >Create new cronjob</Button>
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
              <span>Create a new job</span>
            </ModalHeader>
            <ModalBody>
              <Row>
                <Col>
                  <Form>
                    <FormGroup row>
                      <Label sm="3" className="text-right" for="registry">Registry:</Label>
                      <Col sm="9">
                        <Field
                          className="form-control"
                          name="registry"
                          component={RenderSelect}
                          autoComplete="off"
                          options={registries.items.map(r => r.name)}
                          />
                      </Col>
                    </FormGroup>
                    <FormGroup row>
                      <Label sm="3" className="text-right" for="name">Name:</Label>
                      <Col sm="9">
                        <Field
                          className="form-control"
                          name="name"
                          component={RenderInput}
                          type="text"
                          autoComplete="off"
                          validate={(value) => {
                            if (value.match(validName)) return;
                            return 'Invalid name';
                          }}
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
                          options={namespaces.items}
                          />
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

JobsPage.propTypes = {
  jobs: PropTypes.object,
};

export default JobsPage;

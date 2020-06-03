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
} from 'reactstrap';
import NamespacesTable from '../NamespacesTable';
import RenderInput from '../RenderInput';
import RenderSelect from '../RenderSelect';
import TableFilter from '../TableFilter';

class NamespacesPage extends Component {

  render() {
    const {
      namespaces,
      fetchNamespacesPagination,
      canCreate,
      openModal,
      closeModal,
      newModalOpen,
      handleSubmit,
      submitForm,
      clusters,
      error,
      addFilter,
      removeFilter,
      search,
      clearSearch,
      showFilters,
      hideFilters,
    } = this.props;

    return (
      <Row className="page-frame">
        <Col>
          <Row>
            <Col>
              <TableFilter
                formPrefix="namespaces"
                statePath="namespaces.filter"
                columns={[
                  { value: 'name', display: 'Name' },
                  { value: 'cluster', display: 'Cluster' },
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
              <NamespacesTable namespaces={namespaces.data} loading={namespaces.meta.loading} error={namespaces.meta.error} fetchNamespaces={fetchNamespacesPagination} />
            </Col>
            <Col>
              {
                canCreate ? (
                  <Button
                    color="dark"
                    onClick={() => openModal()}
                    >Create new namespace</Button>
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
              <span>Create a new namespace</span>
            </ModalHeader>
            <ModalBody>
              <Row>
                <Col>
                  <Form>
                    <FormGroup row>
                      <Label sm="3" className="text-right" for="cluster">Cluster:</Label>
                      <Col sm="9">
                        <Field
                          className="form-control"
                          name="cluster"
                          component={RenderSelect}
                          autoComplete="off"
                          options={clusters.items.map(r => r.name)}
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

NamespacesPage.propTypes = {
  namespaces: PropTypes.object,
};

export default NamespacesPage;

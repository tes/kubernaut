import React, { Component } from 'react';
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
import { AdminSubNav } from '../SubNavs';
import RenderInput from '../RenderInput';

class ClusterEditPage extends Component {

  render() {
    const { meta } = this.props;
    if (meta.loading.loadingPercent !== 100) return (
      <Row className="page-frame d-flex justify-content-center">
        <Col sm="12" className="mt-5">
          <Progress animated color="info" value={meta.loading.loadingPercent} />
        </Col>
      </Row>
    );

    if (!this.props.hasClustersWrite) {
      return (
        <Row className="page-frame">
          <Col xs="12">
            <p>You are not authorised to view this page.</p>
          </Col>
        </Row>
      );
    }

    const {
      error,
      cluster,
      canAudit,
      hasClustersWrite,
      handleSubmit,
      submitForm,
    } = this.props;

    return (
      <Row className="page-frame">
        <Col>
          <Title title={`Edit cluster: ${cluster.name}`} />
          <AdminSubNav canAudit={canAudit} hasClustersWrite={hasClustersWrite} edit cluster={cluster}/>
          <Row>
            <Col md="6">
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
                      >Save</Button>
                  </Col>
                </FormGroup>
              </Form>
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }
}

ClusterEditPage.propTypes = {

};

export default ClusterEditPage;

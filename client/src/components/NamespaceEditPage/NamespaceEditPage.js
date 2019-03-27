import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field, FieldArray } from 'redux-form';
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
import { NamespacesSubNav } from '../SubNavs';
import RenderSelect from '../RenderSelect';
import RenderInput from '../RenderInput';

const renderAttributes = (props) => {

  return (
    <Row>
      <Col>
        <h6>Attributes:</h6>
        {props.fields.map((attribute, index) => (
          <Row form key={props.fields.get(index).tempKey}>
            <Col>
              <FormGroup className="row no-gutters" key={attribute}>
                <Col sm="3" className="d-flex">
                  <Field
                    name={`${attribute}.name`}
                    className="form-control"
                    component={RenderInput}
                    type="text"
                    autocomplete="foo-no-really"
                  />
                <span>:</span>
                </Col>
                <Col sm="3">
                  <Field
                    name={`${attribute}.value`}
                    className="form-control"
                    component={RenderInput}
                    type="text"
                    autoComplete="foo-no-really"
                    />
                </Col>
                <Col sm="1">
                  <Button
                    outline
                    color="danger"
                    onClick={(e) => { e.preventDefault(); props.fields.remove(index); }}
                    ><i className={`fa fa-trash`} aria-hidden='true'></i>
                  </Button>
                </Col>
                { index + 1 === props.fields.length ?
                  <Col sm="3">
                    <Button
                      outline
                      color="info"
                      onClick={(e) => { e.preventDefault(); props.fields.push({ tempKey: Math.random() }); }}
                      >Add new attribute
                    </Button>
                  </Col>
                  : null }
            </FormGroup>
            </Col>
          </Row>
        ))}
        <Row>
          { props.fields.length === 0 ?
            <Col sm="3">
              <Button
                outline
                color="info"
                onClick={(e) => { e.preventDefault(); props.fields.push({ tempKey: Math.random() }); }}
                >Add new attribute
              </Button>
            </Col>
          : null}
        </Row>
      </Col>
    </Row>
  );
};

class NamespaceEditPage extends Component {

  render() {
    const { meta } = this.props;
    if (meta.loading.loadingPercent !== 100) return (
      <Row className="page-frame d-flex justify-content-center">
        <Col sm="12" className="mt-5">
          <Progress animated color="info" value={meta.loading.loadingPercent} />
        </Col>
      </Row>
    );

    if (!this.props.canEdit) {
      return (
        <Row className="page-frame">
          <Col xs="12">
            <p>You are not authorised to view this page.</p>
          </Col>
        </Row>
      );
    }

    const error = this.props.error;
    const namespace = this.props.namespace;

    return (
      <Row className="page-frame">
        <Col>
          <Title title={`Edit namespace: ${namespace.clusterName}/${namespace.name}`} />
          <NamespacesSubNav namespace={namespace} canEdit={this.props.canEdit} canManage={this.props.canManage} />
          <Row>
            <Col>
              <Form>
                <Row form>
                  <Col md="6">
                    <FormGroup className="row">
                      <Label for="color" className="col-sm-2 col-form-label text-right">Color:</Label>
                      <Col sm="5">
                        <Field
                          name="color"
                          className="form-control"
                          component={RenderInput}
                          type="text"
                          />
                      </Col>
                    </FormGroup>
                  </Col>
                </Row>
                <Row form>
                  <Col md="6">
                    <FormGroup className="row">
                      <Label for="cluster" className="col-sm-2 col-form-label text-right">Cluster:</Label>
                      <Col sm="5">
                        <Field
                          name="cluster"
                          className="form-control"
                          component={RenderSelect}
                          options={this.props.clusterOptions}
                          />
                      </Col>
                    </FormGroup>
                  </Col>
                </Row>
                <Row form>
                  <Col md="6">
                    <FormGroup className="row">
                      <Label for="context" className="col-sm-2 col-form-label text-right">Context:</Label>
                      <Col sm="5">
                        <Field
                          name="context"
                          className="form-control"
                          component={RenderInput}
                          type="text"
                          />
                      </Col>
                    </FormGroup>
                  </Col>
                </Row>
                <FieldArray
                  name="attributes"
                  component={renderAttributes}
                  />
                <Row className="mt-2">
                  <Col sm="2">
                    <Button
                      outline
                      color="info"
                      onClick={this.props.handleSubmit(this.props.submitForm)}
                      >Save
                    </Button>
                  </Col>
                </Row>
                <Row>
                  <Col sm="12">
                    {error && <span className="help-block"><span className="text-danger">{error}</span></span>}
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

NamespaceEditPage.propTypes = {
  namespaceId: PropTypes.string.isRequired,
  canEdit: PropTypes.bool.isRequired,
  namespace: PropTypes.object.isRequired,
  clusterOptions: PropTypes.array.isRequired,
};

export default NamespaceEditPage;

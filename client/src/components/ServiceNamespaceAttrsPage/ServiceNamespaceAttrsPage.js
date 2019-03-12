import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field, FieldArray } from 'redux-form';
import {
  Container,
  Row,
  Col,
  FormGroup,
  Button,
  Progress,
  Form,
} from 'reactstrap';
import Title from '../Title';
import { ServicesSubNav } from '../SubNavs';
import RenderInput from '../RenderInput';

const renderAttributes = (props) => {

  return (
    <Row>
      <Col>
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

class ServiceNamespaceAttrsPage extends Component {

  render() {
    const { meta } = this.props;
    if (meta.loading.loadingPercent !== 100) return (
      <Container className="page-frame">
        <Row className="d-flex justify-content-center">
          <Col sm="12" className="mt-5">
            <Progress animated color="info" value={meta.loading.loadingPercent} />
          </Col>
        </Row>
      </Container>
    );

    if (!this.props.canManage) {
      return (
        <Container className="page-frame">
          <Row>
            <Col xs="12">
              <p>You are not authorised to view this page.</p>
            </Col>
          </Row>
        </Container>
      );
    }

    const error = this.props.error;
    const namespace = this.props.namespace;

    return (
      <Container className="page-frame">
        <Title title={`${this.props.registryName}/${this.props.serviceName} attributes for: ${namespace.clusterName}/${namespace.name}`} />
        <ServicesSubNav registryName={this.props.registryName} serviceName={this.props.serviceName} canManage={this.props.canManage} namespace={namespace} attributes />
        <Row>
          <Col>
            <Form>
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
      </Container>
    );
  }
}

ServiceNamespaceAttrsPage.propTypes = {
  canManage: PropTypes.bool.isRequired,
  namespace: PropTypes.object.isRequired,
  meta: PropTypes.object.isRequired,
};

export default ServiceNamespaceAttrsPage;

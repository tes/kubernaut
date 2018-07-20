import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field, FieldArray } from 'redux-form';
import {
  Badge,
  Container,
  Row,
  Col,
  FormGroup,
  Label,
  Button,
} from 'reactstrap';
import RenderSelect from '../RenderSelect';
import RenderInput from '../RenderInput';

class NamespaceEditPage extends Component {
  componentDidMount() {
    this.props.initForm({ id: this.props.namespaceId });
  }

  render() {
    if (!this.props.canEdit) {
      return (
        <Container>
          <Row>
            <Col xs="12">
              <p>You are not authorised to view this page.</p>
            </Col>
          </Row>
        </Container>
      );
    }

    const namespace = this.props.namespace;
    const headingBadge = <Badge
        style={{ backgroundColor: namespace.color }}
        pill
      >{namespace.clusterName}/{namespace.name}
      </Badge>;

    const renderAttributes = (props) => {

    return (
        <div>
          <h6>Attributes:</h6>
          {props.fields.map((attribute, index) => (
            <FormGroup className="row">
              <Col sm="3">
                <Field
                  name={`${attribute}.name`}
                  className="form-control"
                  component={RenderInput}
                  type="text"
                  />
              </Col>
              <Col sm="1"><p>:</p></Col>
              <Col sm="5">
                <Field
                  name={`${attribute}.value`}
                  className="form-control"
                  component={RenderInput}
                  type="text"
                  />
              </Col>
              <Col>
                <Button
                  outline
                  color="danger"
                  onClick={(e) => { e.preventDefault(); props.fields.remove(index); }}
                ><i className={`fa fa-trash`} aria-hidden='true'></i>
                </Button>
              </Col>
            </FormGroup>
          ))}
          <Row>
            <Col sm="2">
              <Button
                outline
                color="info"
                onClick={(e) => { e.preventDefault(); props.fields.push({}); }}
              >Add new attribute
              </Button>
            </Col>
          </Row>
        </div>
      );
    };
    return (
      <Container>
        <Row>
          <h4>{headingBadge}</h4>
        </Row>
        <Row>
          <Col sm="12">
            <form onSubmit={(values) => console.info(values) }>
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
              <FieldArray
                name="attributes"
                component={renderAttributes}
              />
            </form>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default NamespaceEditPage;

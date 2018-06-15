import React, { Component } from 'react';
import { Field } from 'redux-form';
import PropTypes from 'prop-types';
import RenderInput from '../RenderInput';


class DeployPage extends Component {
  render() {
    const { error } = this.props;

    return (
      <div>
        <h4>Create deployment</h4>
        <form
          onSubmit={this.props.handleSubmit((values) => this.props.triggerDeployment(values))}
        >
        <div className="form-group row">
          <label className="col-sm-2 col-form-label text-right" htmlFor="registry">Registry:</label>
          <div className="col-sm-5">
            <Field
              className="form-control"
              name="registry"
              component={RenderInput}
              type="text"
            />
          </div>
        </div>
        <div className="form-group row">
          <label className="col-sm-2 col-form-label text-right" htmlFor="service">What:</label>
          <div className="col-sm-5">
            <Field
              className="form-control"
              name="service"
              component={RenderInput}
              type="text"
            />
          </div>
        </div>
        <div className="form-group row">
          <label className="col-sm-2 col-form-label text-right" htmlFor="version">Version:</label>
          <div className="col-sm-5">
            <Field
              className="form-control"
              name="version"
              component={RenderInput}
              type="text"
            />
          </div>
        </div>
        <div className="form-group row">
          <label className="col-sm-2 col-form-label text-right" htmlFor="cluster">Where:</label>
          <div className="col-sm-5">
            <Field
              className="form-control"
              name="cluster"
              component={RenderInput}
              type="text"
            />
          </div>
        </div>
        <div className="form-group row">
          <label className="col-sm-2 col-form-label text-right" htmlFor="namespace">Namespace:</label>
          <div className="col-sm-5">
            <Field
              className="form-control"
              name="namespace"
              component={RenderInput}
              type="text"
            />
          </div>
        </div>
        <div className="form-group row">
          <div className="offset-sm-2 col-sm-10">
            <button type="submit" className="btn btn-dark">Create Deployment</button>
            {error && <span className="help-block"><span className="text-danger">{error}</span></span>}
          </div>
        </div>
        </form>
      </div>
    );
  }
}

DeployPage.propTypes = {
  triggerDeployment: PropTypes.func.isRequired,
};

export default DeployPage;

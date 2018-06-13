import React, { Component } from 'react';
import { Field } from 'redux-form';
import PropTypes from 'prop-types';
import RenderInput from '../RenderInput';


class DeployPage extends Component {
  render() {
    const { error } = this.props;

    return (
      <div>
        <form
          onSubmit={this.props.handleSubmit((values) => this.props.triggerDeployment(values))}
          className="form-horizontal"
        >
        <div className="form-group">
          <label className="col-sm-2 control-label" htmlFor="registry">Registry:</label>
          <div className="col-sm-5">
            <Field
              className="form-control"
              name="registry"
              component={RenderInput}
              type="text"
            />
          </div>
        </div>
        <div className="form-group">
          <label className="col-sm-2 control-label" htmlFor="service">What:</label>
          <div className="col-sm-5">
            <Field
              className="form-control"
              name="service"
              component={RenderInput}
              type="text"
            />
          </div>
        </div>
        <div className="form-group">
          <label className="col-sm-2 control-label" htmlFor="version">Version:</label>
          <div className="col-sm-5">
            <Field
              className="form-control"
              name="version"
              component={RenderInput}
              type="text"
            />
          </div>
        </div>
        <div className="form-group">
          <label className="col-sm-2 control-label" htmlFor="cluster">Where:</label>
          <div className="col-sm-5">
            <Field
              className="form-control"
              name="cluster"
              component={RenderInput}
              type="text"
            />
          </div>
        </div>
        <div className="form-group">
          <label className="col-sm-2 control-label" htmlFor="namespace">Namespace:</label>
          <div className="col-sm-5">
            <Field
              className="form-control"
              name="namespace"
              component={RenderInput}
              type="text"
            />
          </div>
        </div>
        <div className="form-group">
          <div className="col-sm-offset-2 col-sm-10">
            <button type="submit" className="btn btn-default">Create Deployment</button>
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

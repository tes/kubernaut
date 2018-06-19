import React from 'react';
import PropTypes from 'prop-types';

const RenderInput = ({ input, label, type, meta: { error, asyncValidating }, className, disabled }) => (
  <div className="row">
    <div className="col-sm-11">
      <input {...input} placeholder={label} type={type} className={className} disabled={disabled} />
      {error && <span className="help-block"><span className="text-danger">{error}</span></span>}
    </div>
    <div className="col-sm-1">
      { asyncValidating && (<i className="fa fa-spin fa-spinner mt-2" aria-hidden='true' />) }
    </div>
  </div>
);

RenderInput.propTypes = {
  input: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
  meta: PropTypes.object.isRequired,
  className: PropTypes.string,
  disabled: PropTypes.bool,
};

export default RenderInput;

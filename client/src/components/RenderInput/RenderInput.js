import React from 'react';
import PropTypes from 'prop-types';

const RenderInput = ({ input, label, type, meta: { error }, className }) => (
  <div>
    <input {...input} placeholder={label} type={type} className={className} />
      {error && <span className="help-block"><span className="text-danger">{error}</span></span>}
  </div>
);

RenderInput.propTypes = {
  input: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
  meta: PropTypes.object.isRequired,
  className: PropTypes.string,
};

export default RenderInput;

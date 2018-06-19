import React from 'react';
import PropTypes from 'prop-types';

const RenderSelect = ({ input, label, type, meta: { error }, className, options, disabled }) => (
  <div>
    <select {...input} placeholder={label} className={className} disabled={disabled}>
      <option />
        {
          options.map((value) => <option key={value} value={value}>{value}</option>)
        }
    </select>
    {error && <span className="help-block"><span className="text-danger">{error}</span></span>}
  </div>
);

RenderSelect.propTypes = {
  input: PropTypes.object.isRequired,
  meta: PropTypes.object.isRequired,
  options: PropTypes.array.isRequired,
  className: PropTypes.string,
};

export default RenderSelect;

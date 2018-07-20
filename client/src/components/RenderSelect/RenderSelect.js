import React from 'react';
import PropTypes from 'prop-types';

const RenderSelect = ({ input, label, type, meta: { error }, className, options, disabled }) => {
  const optionEls = options.map((optionVal) => {
    if (({}).hasOwnProperty.call(optionVal, 'value')) {
      return <option key={optionVal.value} value={optionVal.value}>{optionVal.display}</option>;
    }
    return <option key={optionVal} value={optionVal}>{optionVal}</option>;
  });

  return (
    <div>
      <select {...input} placeholder={label} className={className} disabled={disabled}>
        <option />
        {optionEls}
      </select>
      {error && <span className="help-block"><span className="text-danger">{error}</span></span>}
    </div>
  );
};

RenderSelect.propTypes = {
  input: PropTypes.object.isRequired,
  meta: PropTypes.object.isRequired,
  options: PropTypes.array.isRequired,
  className: PropTypes.string,
};

export default RenderSelect;

import React, { Component } from 'react';
import PropTypes from 'prop-types';

class RenderInput extends Component {
  constructor(props) {
    super(props);

    this.textInput = React.createRef();
    this.focusInput = this.focusInput.bind(this);
  }

  focusInput() {
    this.textInput.current.focus();
  }

  render() {
    const {
      input,
      label,
      type,
      meta: {
        error,
        asyncValidating
      },
      className,
      disabled,
      autoComplete,
      placeholder,
      onChangeListener, // onChange is great, unless you want to run a function/saga that fetches all form values which you expect to include the change performed in this event.
    } = this.props;

    return (
      <div className="row">
        <div className="col-sm-11">
          <input
            {...input}
            placeholder={placeholder || label}
            type={type}
            className={className}
            disabled={disabled}
            autoComplete={autoComplete}
            ref={this.textInput}
            onChange={(evt) => {
              input.onChange(evt); // do this first - else redux-form reducer won't have run before our func is run.
              if (onChangeListener) {
                onChangeListener();
              }
            }}
          />
          {error && <span className="help-block"><span className="text-danger">{error}</span></span>}
        </div>
        <div className="col-sm-1">
          { asyncValidating && (<i className="fa fa-spin fa-spinner mt-2" aria-hidden='true' />) }
        </div>
      </div>
    );
  }
}

RenderInput.propTypes = {
  input: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
  meta: PropTypes.object.isRequired,
  className: PropTypes.string,
  disabled: PropTypes.bool,
};

export default RenderInput;

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Popover, PopoverHeader, PopoverBody } from 'reactstrap';

class RenderInput extends Component {
  constructor(props) {
    super(props);

    this.textInput = React.createRef();
    this.focusInput = this.focusInput.bind(this);
    this.setPopoverOpen = this.setPopoverOpen.bind(this);

    this.state = {
      popoverOpen: false
    };
  }

  focusInput() {
    this.textInput.current.focus();
  }

  setPopoverOpen(value) {
    this.setState({
      popoverOpen: value,
    });
  }

  render() {
    const {
      input,
      label,
      type,
      meta: {
        error,
        warning,
        asyncValidating
      },
      className,
      disabled,
      autoComplete,
      placeholder,
      onChangeListener, // onChange is great, unless you want to run a function/saga that fetches all form values which you expect to include the change performed in this event.
      popover = {},
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
            onFocus={(...args)=> {
              input.onFocus(...args);
              if (popover && popover.title) {
                this.setPopoverOpen(true);
              }
            }}
            onBlur={(...args)=> {
              input.onBlur(...args);
              if (popover && popover.title) {
                this.setPopoverOpen(false);
              }
            }}
          />
          {error && <span className="help-block"><span className="text-danger">{error}</span></span>}
          {warning && <span className="help-block"><span className="text-warning">{warning}</span></span>}
        </div>
        <div className="col-sm-1">
          { asyncValidating && (<i className="fa fa-spin fa-spinner mt-2" aria-hidden='true' />) }
        </div>
        <Popover
          placement={popover.placement || 'auto'}
          trigger="focus click hover"
          className="shadow-sm"
          target={this.textInput}
          isOpen={this.state.popoverOpen}
        >
          <PopoverHeader>{popover.title}</PopoverHeader>
          <PopoverBody>{popover.body}</PopoverBody>
        </Popover>
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

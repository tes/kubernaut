/* eslint-disable react-hooks/rules-of-hooks */
import React from 'react';
import { Row, Col, Button } from 'reactstrap';
import PropTypes from 'prop-types';

const RenderInput = (props) => {
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
    onChangeListener,
    useSuggestion,
    suggestions = [],
  } = props;

  return (
    <Row>
      <Col sm="12">
        <Row>
          <div className="col-sm-11">
            <input
              {...input}
              placeholder={label}
              type={type}
              className={className}
              disabled={disabled}
              autoComplete={autoComplete}
              onChange={(evt) => {
                input.onChange(evt); // do this first - else redux-form reducer won't have run before our func is run.
                onChangeListener();
              }}
            />
          </div>
          <div className="col-sm-1">
            { asyncValidating && (<i className="fa fa-spin fa-spinner mt-2" aria-hidden='true' />) }
          </div>
        </Row>
        <Row>
          <Col sm="12">
            { suggestions.length ?
              <ul className="list-inline">
                {
                  suggestions.map((s) => (
                    <li key={s} className="list-inline-item">
                      <Button color="link" onClick={() => useSuggestion(s)}>{s && s.display ? s.display : s}</Button>
                    </li>
                  ))
                }
              </ul>
            : null }
          </Col>
        </Row>
        <Row>
          <Col sm="12">
            {error && <span className="help-block"><span className="text-danger">{error}</span></span>}
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

RenderInput.propTypes = {
  input: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
  meta: PropTypes.object.isRequired,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  onChangeListener: PropTypes.func.isRequired,
};

export default RenderInput;

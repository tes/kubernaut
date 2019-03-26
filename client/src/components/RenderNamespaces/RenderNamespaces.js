import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Button,
} from 'reactstrap';
import { NamespacePill } from '../Links';

const outlinedDropDownToggle = (props) => <Button outline color="secondary" {...props} />;

class RenderSecretVersions extends Component {
  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.state = {
      open: false,
    };
  }

  toggle() {
    this.setState({
      open: !this.state.open
    });
  }

  render() {
    const { input, className, options, disabled } = this.props;
    const isDisabled = disabled || options.length === 0;

    const currentSelected = input.value ? options.find(v => (v.id === input.value)) : null;
    const displayValue = currentSelected ? <NamespacePill namespace={currentSelected} /> : 'Choose a cluster/namespace:';
    const maxHeight = window.innerHeight - 50 < 500 ? window.innerHeight - 50 : 500;

    return (
      <Dropdown className={className} isOpen={this.state.open} toggle={this.toggle} disabled={isDisabled}>
        <DropdownToggle disabled={isDisabled} className="w-100 d-flex" tag={outlinedDropDownToggle}>
          <span className="mr-auto">{displayValue}</span><i className="fa fa-caret-down"></i>
        </DropdownToggle>
        <DropdownMenu
          className="w-100"
          modifiers={{
            bob: {
              enabled: true,
              fn: (data) => {
                return {
                  ...data,
                  styles: {
                    ...data.styles,
                    overflow: 'auto',
                    maxHeight,
                  },
                };
              },
            },
          }}
        >
          {
            options.map(namespace => (
              <DropdownItem
                key={namespace.id}
                onClick={() => {
                  input.onChange(namespace.id);
                }}
              ><NamespacePill namespace={namespace} /></DropdownItem>
            ))
          }
        </DropdownMenu>
      </Dropdown>
    );
  }
}

RenderSecretVersions.propTypes = {
  input: PropTypes.object.isRequired,
  options: PropTypes.array.isRequired,
  className: PropTypes.string,
};

export default RenderSecretVersions;

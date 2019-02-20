import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';

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

    const currentSelectedVersion = input.value ? options.find(v => (v.id === input.value)) : null;
    const displayValue = currentSelectedVersion ? `${currentSelectedVersion.comment} - ${currentSelectedVersion.createdBy.displayName}` : 'Choose a secret:';
    const maxHeight = window.innerHeight - 50 < 500 ? window.innerHeight - 50 : 500;

    return (
      <Dropdown className={className} isOpen={this.state.open} toggle={this.toggle} disabled={isDisabled}>
        <DropdownToggle disabled={isDisabled} className="w-100">
          {displayValue}
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
            options.map(version => (
              <DropdownItem
                key={version.id}
                onClick={() => {
                  input.onChange(version.id);
                }}
              >{version.comment} - {version.createdBy.displayName}</DropdownItem>
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

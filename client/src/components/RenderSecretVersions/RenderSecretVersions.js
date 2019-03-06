import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Button,
} from 'reactstrap';

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

    const currentSelectedVersion = input.value ? options.find(v => (v.id === input.value)) : null;
    const displayValue = currentSelectedVersion ? `${currentSelectedVersion.comment} - ${currentSelectedVersion.createdBy.displayName}` : 'Choose a version:';
    const maxHeight = window.innerHeight - 50 < 500 ? window.innerHeight - 50 : 500;
    const displayExistsNewerWarning = input.value && options.findIndex(v => v.id === input.value) > 0;
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
        { displayExistsNewerWarning ?
          <span className="help-block"><span className="text-info">There is a newer version available.</span></span>
        : null }
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

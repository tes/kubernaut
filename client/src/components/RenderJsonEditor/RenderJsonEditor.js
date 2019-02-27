import React, { Component } from 'react';
import PropTypes from 'prop-types';
import AceEditor from 'react-ace';
import 'brace/mode/json';
import 'brace/theme/vibrant_ink';
import 'brace/ext/language_tools';
require('brace');

class RenderJsonEditor extends Component {
  render() {
    return (
      <AceEditor
        value={this.props.input.value}
        mode="json"
        theme="vibrant_ink"
        onChange={this.props.input.onChange}
        name={`${this.props.input.name}-editor`}
        editorProps={{
          $blockScrolling: true,
        }}
        setOptions={{
          useSoftTabs: true
        }}
        enableBasicAutocompletion={true}
        enableLiveAutocompletion={true}
        tabSize={2}
        width="100%"
        height="300px"
        showPrintMargin={false}
      />
    );
  }
}

RenderJsonEditor.propTypes = {
  input: PropTypes.object.isRequired,
};

export default RenderJsonEditor;

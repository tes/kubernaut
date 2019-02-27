import React, { Component } from 'react';
import PropTypes from 'prop-types';
import AceEditor from 'react-ace';
import 'brace/mode/json';
import 'brace/theme/github';
import 'brace/ext/language_tools';
require('brace');

class RenderJsonEditor extends Component {
  render() {
    return (
      <AceEditor
        value={this.props.input.value}
        mode="json"
        theme="github"
        onChange={this.props.input.onChange}
        onValidate={(annotations) => {
          (this.props.validateAnnotations || (() => {}))({ annotations, index: this.props.index });
        }}
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
        width="95%"
        height="70vh"
        showPrintMargin={false}
      />
    );
  }
}

RenderJsonEditor.propTypes = {
  input: PropTypes.object.isRequired,
};

export default RenderJsonEditor;

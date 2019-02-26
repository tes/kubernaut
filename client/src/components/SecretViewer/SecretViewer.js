import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardBody,
  CardHeader,
} from 'reactstrap';
import AceEditor from 'react-ace';
import 'brace/mode/json';
import 'brace/theme/vibrant_ink';
import 'brace/ext/language_tools';
require('brace');

class SecretViewer extends Component {

  render() {
    const {
      secret,
    } = this.props;

    let contentTag;

    if (secret.editor === 'simple') {
      contentTag = <pre>{secret.value}</pre>;
    }

    if (secret.editor === 'json') {
      contentTag = <AceEditor
        value={secret.value}
        mode="json"
        theme="vibrant_ink"
        name={`${secret.key}-editor`}
        editorProps={{
          $blockScrolling: true,
        }}
        setOptions={{
          useSoftTabs: true
        }}
        tabSize={2}
        width="100%"
        height="300px"
        showPrintMargin={false}
        readOnly
      />;
    }

    return (
      <Card className="mb-2">
        <CardHeader className="d-flex justify-content-between">
          <div>{secret.key}</div>
        </CardHeader>
        <CardBody>
          {contentTag}
        </CardBody>
      </Card>
    );
  }
}

SecretViewer.propTypes = {
  secret: PropTypes.object.isRequired,
};

export default SecretViewer;

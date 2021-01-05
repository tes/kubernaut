import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardBody,
  CardHeader,
} from 'reactstrap';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/mode-plain_text';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/ext-language_tools';
import "ace-builds/webpack-resolver";

class SecretViewer extends Component {

  render() {
    const {
      secret,
    } = this.props;

    let contentTag;

    if (secret.editor === 'simple') {
      contentTag = <pre>{secret.value}</pre>;
    }

    if (secret.editor === 'json' || secret.editor === 'plain_text') {
      contentTag = <AceEditor
        value={secret.value}
        mode={secret.editor}
        theme="github"
        name={`${secret.key}-editor`}
        editorProps={{
          $blockScrolling: true
        }}
        setOptions={{
          maxLines: 50,
          useSoftTabs: true,
        }}
        tabSize={2}
        width="100%"
        height="100%"
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

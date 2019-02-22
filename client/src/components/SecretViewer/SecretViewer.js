import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardBody,
  CardHeader,
} from 'reactstrap';
import JSONInput from 'react-json-editor-ajrm';
import locale    from 'react-json-editor-ajrm/locale/en';

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
      contentTag = <JSONInput locale={ locale } theme='darktheme' height viewOnly placeholder={JSON.parse(secret.value)} onChange={(val) => console.info(val)}/>;
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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormGroup, InputGroup, FormControl } from 'react-bootstrap';
import './TableCriteria.css';

class TableCriteria extends Component {

  componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  onCriteriaChange(source) {
    clearTimeout(this.timeout);
    const terms = source.split(/\s*,\s*/).reduce((terms, nvp) => {
      const [ name, value ] = nvp.split(/:/).map((s) => s.trim());
      terms[name] = terms[name] || [];
      terms[name].push(value);
      return terms;
    }, {});
    this.timeout = setTimeout(() => this.props.fetchContent({ source, terms }), 500);
  }

  render () {
    return (
      <form className='table-criteria'>
        <FormGroup>
          <InputGroup>
            <InputGroup.Addon>
              <span className='table-criteria__icon glyphicon glyphicon-search'></span>
            </InputGroup.Addon>
            <FormControl
              defaultValue={this.props.criteria.source}
              onChange={(e) => this.onCriteriaChange(e.target.value) }
              type='text' placeholder={this.props.placeholder || 'Search criteria'}
            />
          </InputGroup>
        </FormGroup>
      </form>
    );
  }
}

TableCriteria.propTypes = {
  criteria: PropTypes.object.isRequired,
  placeholder: PropTypes.string,
  fetchContent: PropTypes.func.isRequired,
};

export default TableCriteria;

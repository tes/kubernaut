import React from 'react';
export { default } from './TableFilterContainer';

export const CreateQuickFilters = (addFilter) => {
  return {
    QuickFilters: ({ value, column, displayValue }) => (
      <span className="cellFilterActions ml-2">
        <i
          className="fa fa-search-plus clickable"
          aria-hidden="true"
          onClick={() => {
            addFilter({
              filters: [{
                value,
                key: column,
                exact: true,
                displayValue,
              }]
            });
          }}
          ></i>
        <i
          className="fa fa-search-minus ml-1 clickable"
          aria-hidden="true"
          onClick={() => {
            addFilter({
              filters: [{
                value,
                key: column,
                exact: true,
                not: true,
                displayValue,
              }]
            });
          }}
          ></i>
      </span>
    ),
    MultiQuickFilters: ({ filters = [] }) => (
      <span className="cellFilterActions ml-2">
        <i
          className="fa fa-search-plus clickable"
          aria-hidden="true"
          onClick={() => {
            addFilter({
              filters: filters.map(f => ({
                value: f.value,
                key: f.column,
                exact: true,
              }))
            });
          }}
          ></i>
        <i
          className="fa fa-search-minus ml-1 clickable"
          aria-hidden="true"
          onClick={() => {
            addFilter({
              filters: filters.map(f => ({
                value: f.value,
                key: f.column,
                exact: true,
                not: true,
              }))
            });
          }}
          ></i>
      </span>
    ),
  };
};

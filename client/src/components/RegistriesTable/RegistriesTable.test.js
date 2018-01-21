import React from 'react';
import { shallow, } from 'enzyme';
import R from 'ramda';
import RegistriesTable from './RegistriesTable';
import { Human, Ago, } from '../DisplayDate';
import { AccountLink, RegistryLink, } from '../Links';

describe('RegistriesTable', () => {

  it('should render table heading', () => {
    const wrapper = renderRegistriesTable();

    expect(wrapper.find('.registries-table__heading').exists()).toBe(true);
    expect(wrapper.find('.registries-table__heading__created-date').text()).toBe('Created');
    expect(wrapper.find('.registries-table__heading__registry-name').text()).toBe('Name');
    expect(wrapper.find('.registries-table__heading__created-by').text()).toBe('Created By');
  });

  it('should render empty table', () => {
    const registries = { limit: 0, offset: 0, count: 0, pages: 10, currentPage: 1, items: [], };
    const wrapper = renderRegistriesTable({ registries, });

    expect(wrapper.find('.registries-table__body--empty').exists()).toBe(true);
    expect(wrapper.find('.registries-table__body__row').length).toBe(1);
    expect(wrapper.find('.registries-table__body__row').text()).toBe('There are no registries');
  });

  it('should render table with data', () => {
    const items = R.times((i) => {
      return {
        id: `registry-${i+1}`,
        name: 'svc-ns',
        createdOn: new Date('2017-07-01T16:15:14.000Z'),
        createdBy: {
          id: '123',
          displayName: 'Roy Walker',
        },
      };
    }, 50);
    const registries = { limit: 50, offset: 0, count: items.length, pages: 10, currentPage: 1, items, };
    const wrapper = renderRegistriesTable({ registries, });

    expect(wrapper.find('.registries-table__body--data').exists()).toBe(true);
    expect(wrapper.find('.registries-table__body__row').length).toBe(50);
    const row = wrapper.find('.registries-table__body__row').at(0);

    expect(row.prop('id')).toBe('registry-1');
    expect(row.find('.registries-table__body__row__created-date__on').find(Human).prop('date')).toBe(registries.items[0].createdOn);
    expect(row.find('.registries-table__body__row__created-date__ago').find(Ago).prop('date')).toBe(registries.items[0].createdOn);
    expect(row.find('.registries-table__body__row__registry-name').find(RegistryLink).prop('registry')).toBe(registries.items[0]);
    expect(row.find('.registries-table__body__row__created-by').find(AccountLink).prop('account')).toBe(registries.items[0].createdBy);
  });

  it('should render table while loading', () => {

    const wrapper = renderRegistriesTable({ loading: true, });

    expect(wrapper.find('.registries-table__body--loading').exists()).toBe(true);
    expect(wrapper.find('.registries-table__body__row').length).toBe(1);
    expect(wrapper.find('.registries-table__body__row').text()).toBe('Loading registries…');
  });

  it('should render table with error', () => {

    const wrapper = renderRegistriesTable({ error: new Error(), });

    expect(wrapper.find('.registries-table__body--error').exists()).toBe(true);
    expect(wrapper.find('.registries-table__body__row').length).toBe(1);
    expect(wrapper.find('.registries-table__body__row').text()).toBe('Error loading registries');
  });


  function renderRegistriesTable(props) {
    return shallow(
      <RegistriesTable { ...props }  />
    );
  }

});

import React from 'react';
import { shallow, } from 'enzyme';
import R from 'ramda';
import AccountsTable from './AccountsTable';
import { Human, Ago, } from '../DisplayDate';

describe('AccountsTable', () => {

  it('should render table heading', () => {

    const wrapper = renderAccountsTable();

    expect(wrapper.find('.accounts-table__heading').exists()).toBe(true);
    expect(wrapper.find('.accounts-table__heading__created').text()).toBe('Created');
    expect(wrapper.find('.accounts-table__heading__display-name').text()).toBe('Name');
  });

  it('should render empty table', () => {

    const accounts = { limit: 0, offset: 0, count: 0, pages: 10, currentPage: 1, items: [], };
    const wrapper = renderAccountsTable({ accounts, });

    expect(wrapper.find('.accounts-table__body--empty').exists()).toBe(true);
    expect(wrapper.find('.accounts-table__body__row').length).toBe(1);
    expect(wrapper.find('.accounts-table__body__row').text()).toBe('There are no accounts');

  });

  it('should render table with data', () => {

    const items = R.times((i) => {
      return {
        id: `account-${i+1}`,
        createdOn: new Date('2017-07-01T16:15:14.000Z'),
        displayName: 'Bob Holness',
      };
    }, 50);
    const accounts = { limit: 50, offset: 0, count: items.length, pages: 10, currentPage: 1, items, };
    const wrapper = renderAccountsTable({ accounts, });

    expect(wrapper.find('.accounts-table__body--data').exists()).toBe(true);
    expect(wrapper.find('.accounts-table__body__row').length).toBe(50);
    const row = wrapper.find('.accounts-table__body__row').at(0);

    expect(row.prop('id')).toBe('account-1');
    expect(row.find('.accounts-table__body__row__created__on').find(Human).prop('date')).toBe(accounts.items[0].createdOn);
    expect(row.find('.accounts-table__body__row__created__ago').find(Ago).prop('date')).toBe(accounts.items[0].createdOn);
    expect(row.find('.accounts-table__body__row__display-name').text()).toBe(accounts.items[0].displayName);
  });

  it('should render table while loading', () => {

    const wrapper = renderAccountsTable({ loading: true, });

    expect(wrapper.find('.accounts-table__body--loading').exists()).toBe(true);
    expect(wrapper.find('.accounts-table__body__row').length).toBe(1);
    expect(wrapper.find('.accounts-table__body__row').text()).toBe('Loading accounts…');
  });

  it('should render table with error', () => {

    const wrapper = renderAccountsTable({ error: new Error(), });

    expect(wrapper.find('.accounts-table__body--error').exists()).toBe(true);
    expect(wrapper.find('.accounts-table__body__row').length).toBe(1);
    expect(wrapper.find('.accounts-table__body__row').text()).toBe('Error loading accounts');
  });


  function renderAccountsTable(props) {
    return shallow(
      <AccountsTable { ...props }  />
    );
  }

});

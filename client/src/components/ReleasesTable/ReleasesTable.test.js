import React from 'react';
import { shallow, } from 'enzyme';
import R from 'ramda';
import ReleasesTable from './ReleasesTable';
import { Human, Ago, } from '../DisplayDate';

describe('ReleasesTable', () => {

  xit('should render table heading', () => {

    const wrapper = renderReleasesTable();

    expect(wrapper.is('.releases-table')).toBe(true);
    expect(wrapper.find('.releases-table__heading').exists()).toBe(true);
    expect(wrapper.find('.releases-table__heading__created').text()).toBe('Created');
    expect(wrapper.find('.releases-table__heading__service-name').text()).toBe('Service');
    expect(wrapper.find('.releases-table__heading__version').text()).toBe('Version');
  });

  xit('should render empty table', () => {

    const wrapper = renderReleasesTable({ releases: [], });

    expect(wrapper.is('.releases-table')).toBe(true);
    expect(wrapper.find('.releases-table__body--empty').exists()).toBe(true);
    expect(wrapper.find('.releases-table__body__row').length).toBe(1);
    expect(wrapper.find('.releases-table__body__row').text()).toBe('There are no releases');

  });

  it('should render table with data', () => {

    const releases = R.times((i) => {
      return {
        id: `release-${i+1}`,
        createdOn: new Date('2017-07-01T16:15:14.000Z'),
        service: {
          name: 'svc-awesome',
        },
        version: `v${i+1}`,
      };
    }, 50);
    const wrapper = renderReleasesTable({ releases, });

    expect(wrapper.is('.releases-table')).toBe(true);
    expect(wrapper.find('.releases-table__body--data').exists()).toBe(true);
    expect(wrapper.find('.releases-table__body__row').length).toBe(50);
    const row = wrapper.find('.releases-table__body__row').at(0);

    expect(row.prop('id')).toBe('release-1');
    expect(row.find('.releases-table__body__row__created__on').find(Human).prop('date')).toBe(releases[0].createdOn);
    expect(row.find('.releases-table__body__row__created__ago').find(Ago).prop('date')).toBe(releases[0].createdOn);
    expect(row.find('.releases-table__body__row__service-name').text()).toBe(releases[0].service.name);
    expect(row.find('.releases-table__body__row__version').text()).toBe(releases[0].version);
  });

  it('should render table while loading', () => {

    const wrapper = renderReleasesTable({ loading: true, });

    expect(wrapper.is('.releases-table')).toBe(true);
    expect(wrapper.find('.releases-table__body--loading').exists()).toBe(true);
    expect(wrapper.find('.releases-table__body__row').length).toBe(1);
    expect(wrapper.find('.releases-table__body__row').text()).toBe('Loading releases…');
  });

  it('should render table with error', () => {

    const wrapper = renderReleasesTable({ error: new Error(), });

    expect(wrapper.is('.releases-table')).toBe(true);
    expect(wrapper.find('.releases-table__body--error').exists()).toBe(true);
    expect(wrapper.find('.releases-table__body__row').length).toBe(1);
    expect(wrapper.find('.releases-table__body__row').text()).toBe('Error loading releases');

  });


  function renderReleasesTable(props) {
    return shallow(
      <ReleasesTable { ...props }  />
    );
  }

});

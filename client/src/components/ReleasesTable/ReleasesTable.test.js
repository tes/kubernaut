import React from 'react';
import { shallow } from 'enzyme';
import R from 'ramda';
import ReleasesTable from './ReleasesTable';
import { Human, Ago } from '../DisplayDate';
import { AccountLink, RegistryLink, ServiceLink, ReleaseLink } from '../Links';

describe('ReleasesTable', () => {

  it('should render table heading', () => {
    const wrapper = renderReleasesTable();

    expect(wrapper.find('.releases-table__heading').exists()).toBe(true);
    expect(wrapper.find('.releases-table__heading__created-date').text()).toBe('Created');
    expect(wrapper.find('.releases-table__heading__registry-name').text()).toBe('Registry');
    expect(wrapper.find('.releases-table__heading__service-name').text()).toBe('Service');
    expect(wrapper.find('.releases-table__heading__version').text()).toBe('Version');
    expect(wrapper.find('.releases-table__heading__created-by').text()).toBe('Created By');
  });

  it('should render empty table', () => {
    const releases = { limit: 0, offset: 0, count: 0, pages: 10, page: 1, items: [] };
    const wrapper = renderReleasesTable({ releases });

    expect(wrapper.find('.releases-table__body--empty').exists()).toBe(true);
    expect(wrapper.find('.releases-table__body__row').length).toBe(1);
    expect(wrapper.find('.releases-table__body__row').text()).toBe('There are no releases');
  });

  it('should render table with data', () => {

    const items = R.times((i) => {
      return {
        id: `release-${i+1}`,
        createdOn: new Date('2017-07-01T16:15:14.000Z'),
        createdBy: {
          id: '123',
          displayName: 'Roy Walker',
        },
        service: {
          name: 'svc-awesome',
          registry: {
            name: 'svc-ns',
          },
        },
        version: `v${i+1}`,
      };
    }, 50);
    const releases = { limit: 50, offset: 0, count: items.length, pages: 10, page: 1, items };
    const wrapper = renderReleasesTable({ releases });

    expect(wrapper.find('.releases-table__body--data').exists()).toBe(true);
    expect(wrapper.find('.releases-table__body__row').length).toBe(50);
    const row = wrapper.find('.releases-table__body__row').at(0);

    expect(row.prop('id')).toBe('release-1');
    expect(row.find('.releases-table__body__row__created-date__on').find(Human).prop('date')).toBe(releases.items[0].createdOn);
    expect(row.find('.releases-table__body__row__created-date__ago').find(Ago).prop('date')).toBe(releases.items[0].createdOn);
    expect(row.find('.releases-table__body__row__registry-name').find(RegistryLink).prop('registry')).toBe(releases.items[0].service.registry);
    expect(row.find('.releases-table__body__row__service-name').find(ServiceLink).prop('service')).toBe(releases.items[0].service);
    expect(row.find('.releases-table__body__row__version').find(ReleaseLink).prop('release')).toBe(releases.items[0]);
    expect(row.find('.releases-table__body__row__created-by').find(AccountLink).prop('account')).toBe(releases.items[0].createdBy);
  });

  it('should render table while loading', () => {

    const wrapper = renderReleasesTable({ loading: true });

    expect(wrapper.find('.releases-table__body--loading').exists()).toBe(true);
    expect(wrapper.find('.releases-table__body__row').length).toBe(1);
    expect(wrapper.find('.releases-table__body__row').text()).toBe('Loading releases…');
  });

  it('should render table with error', () => {

    const wrapper = renderReleasesTable({ error: new Error() });

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

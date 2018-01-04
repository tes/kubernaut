import React from 'react';
import { shallow, } from 'enzyme';
import R from 'ramda';
import DeploymentsTable from './DeploymentsTable';
import { Human, Ago, } from '../DisplayDate';

describe('DeploymentsTable', () => {

  it('should render table heading', () => {

    const wrapper = renderDeploymentsTable();

    expect(wrapper.find('.deployments-table__heading').exists()).toBe(true);
    expect(wrapper.find('.deployments-table__heading__created').text()).toBe('Created');
    expect(wrapper.find('.deployments-table__heading__namespace-name').text()).toBe('Namespace');
    expect(wrapper.find('.deployments-table__heading__service-name').text()).toBe('Service');
    expect(wrapper.find('.deployments-table__heading__version').text()).toBe('Version');
    expect(wrapper.find('.deployments-table__heading__context').text()).toBe('Context');
  });

  it('should render empty table', () => {

    const deployments = { limit: 0, offset: 0, count: 0, pages: 10, currentPage: 1, items: [], };
    const wrapper = renderDeploymentsTable({ deployments, });

    expect(wrapper.find('.deployments-table__body--empty').exists()).toBe(true);
    expect(wrapper.find('.deployments-table__body__row').length).toBe(1);
    expect(wrapper.find('.deployments-table__body__row').text()).toBe('There are no deployments');

  });

  it('should render table with data', () => {

    const items = R.times((i) => {
      return {
        id: `deployment-${i+1}`,
        context: 'test',
        createdOn: new Date('2017-07-01T16:15:14.000Z'),
        release: {
          service: {
            name: 'svc-awesome',
            namespace: {
              name: 'svc-ns',
            },
          },
          version: `v${i+1}`,
        },
      };
    }, 50);
    const deployments = { limit: 50, offset: 0, count: items.length, pages: 10, currentPage: 1, items, };
    const wrapper = renderDeploymentsTable({ deployments, });

    expect(wrapper.find('.deployments-table__body--data').exists()).toBe(true);
    expect(wrapper.find('.deployments-table__body__row').length).toBe(50);
    const row = wrapper.find('.deployments-table__body__row').at(0);

    expect(row.prop('id')).toBe('deployment-1');
    expect(row.find('.deployments-table__body__row__created__on').find(Human).prop('date')).toBe(deployments.items[0].createdOn);
    expect(row.find('.deployments-table__body__row__created__ago').find(Ago).prop('date')).toBe(deployments.items[0].createdOn);
    expect(row.find('.deployments-table__body__row__namespace-name').text()).toBe(deployments.items[0].release.service.namespace.name);
    expect(row.find('.deployments-table__body__row__service-name').text()).toBe(deployments.items[0].release.service.name);
    expect(row.find('.deployments-table__body__row__version').text()).toBe(deployments.items[0].release.version);
    expect(row.find('.deployments-table__body__row__context').text()).toBe(deployments.items[0].context);
  });

  it('should render table while loading', () => {

    const wrapper = renderDeploymentsTable({ loading: true, });

    expect(wrapper.find('.deployments-table__body--loading').exists()).toBe(true);
    expect(wrapper.find('.deployments-table__body__row').length).toBe(1);
    expect(wrapper.find('.deployments-table__body__row').text()).toBe('Loading deployments…');
  });

  it('should render table with error', () => {

    const wrapper = renderDeploymentsTable({ error: new Error(), });

    expect(wrapper.find('.deployments-table__body--error').exists()).toBe(true);
    expect(wrapper.find('.deployments-table__body__row').length).toBe(1);
    expect(wrapper.find('.deployments-table__body__row').text()).toBe('Error loading deployments');
  });


  function renderDeploymentsTable(props) {
    return shallow(
      <DeploymentsTable { ...props }  />
    );
  }

});

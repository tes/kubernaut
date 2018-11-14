import React from 'react';
import { shallow } from 'enzyme';
import { Human, Ago } from './DisplayDate';

describe('DisplayDate', () => {

   describe('Human', () => {

     it('should render human date', () => {

      const date = new Date('2017-07-01T16:15:14.000Z');

      const wrapper = shallow(
        <Human date={date} />
      );

      expect(wrapper.is('.display-date--human')).toBe(true);
      expect(wrapper.text()).toBe('Sat, Jul 1, 2017, 4:15:14 PM');
    });

    it('should tolerate string dates', () => {

      const date = '2017-07-01T16:15:14.000Z';

      const wrapper = shallow(
        <Human date={date} />
      );

      expect(wrapper.text()).toBe('Sat, Jul 1, 2017, 4:15:14 PM');
    });

    it('should tolerate undefined dates', () => {

      const date = undefined;

      const wrapper = shallow(
        <Human date={date} />
      );

      expect(wrapper.text()).toBe('');
    });

    it('should tolerate null dates', () => {

      const date = null;

      const wrapper = shallow(
        <Human date={date} />
      );

      expect(wrapper.text()).toBe('');
    });

    it('should tolerate invalid dates', () => {

      const date = new Date(NaN);

      const wrapper = shallow(
        <Human date={date} />
      );

      expect(wrapper.text()).toBe('');
    });
  });

  describe('Ago', () => {

    it('should render ago', () => {

      const date = new Date();

      const wrapper = shallow(
        <Ago date={date} />
      );

      expect(wrapper.is('.display-date--ago')).toBe(true);
      expect(wrapper.text()).toBe('just now');
    });

    it('should tolerate string dates', () => {

      const date = new Date().toISOString();

      const wrapper = shallow(
        <Ago date={date} />
      );

      expect(wrapper.text()).toBe('just now');
    });

    it('should tolerate undefined dates', () => {

      const date = undefined;

      const wrapper = shallow(
        <Ago date={date} />
      );

      expect(wrapper.text()).toBe('');
    });

    it('should tolerate null dates', () => {

      const date = null;

      const wrapper = shallow(
        <Ago date={date} />
      );

      expect(wrapper.text()).toBe('');
    });

    it('should tolerate invalid dates', () => {

      const date = new Date(NaN);

      const wrapper = shallow(
        <Ago date={date} />
      );

      expect(wrapper.text()).toBe('');
    });
  });

});

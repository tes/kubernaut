import system from '../lib/system';
import { fake as clock, } from 'groundhog-day';
import store from '../lib/components/store/fake';

export default function() {
  return system()
      .set('clock', clock())
      .set('store', store()).dependsOn('clock')
      .remove('postgres')
      .remove('migrator');
}


import system from '../lib/system';
import { fake as clock, } from 'groundhog-day';
import memory from '../lib/components/stores/memory';

export default function() {
  return system()
      .set('clock', clock())
      .remove('postgres')
      .remove('migrator')
      .include(memory);
}


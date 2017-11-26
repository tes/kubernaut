import system from '../lib/system';
import { fake as clock, } from 'groundhog-day';
import memorySession from '../lib/components/express/session-memory';
import memoryStore from '../lib/components/stores/memory';

export default function() {
  return system()
      .set('clock', clock())
      .remove('postgres')
      .remove('migrator')
      .set('session', memorySession()).dependsOn('config', 'logger')
      .include(memoryStore);
}


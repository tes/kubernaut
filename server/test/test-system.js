import system from '../lib/system';
import { fake as clock, } from 'groundhog-day';
import memorySession from '../lib/components/express/session-memory';
// import memoryStore from '../lib/components/stores/memory';
import kubernetes from '../lib/components/kubernetes/kubernetes-stub';

export default function() {
  return system()
      .set('clock', clock())
      .set('session', memorySession()).dependsOn('config', 'logger')
      .set('kubernetes', kubernetes()).dependsOn('config', 'logger');
}

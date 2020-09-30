import expect from 'expect';
import createSystem from '../test-system';
import {
  makeRootMeta,
  makeRelease,
  makeNamespace,
  makeCluster,
} from '../factories';

describe('Ingress store', () => {
  let system = { stop: cb => cb() };
  let store = { nuke: () => new Promise(cb => cb()) };

  before(async () => {
    system = createSystem().remove('server');
    ({ store } = await system.start());
  });

  beforeEach(async () => {
    await store.nuke();
  });

  after(async () => {
    await store.nuke();
    await system.stop();
  });

  describe('Ingress host key', () => {
    it('saves a host key and gets it by id', async () => {
      const id = await store.saveIngressHostKey('testKey', makeRootMeta());
      const hostKey = await store.getIngressHostKey(id);
      expect(hostKey.name).toBe('testKey');
    });

    it('finds host keys', async () => {
      await store.saveIngressHostKey('testKey', makeRootMeta());
      await store.saveIngressHostKey('testKey2', makeRootMeta());

      const results = await store.findIngressHostKeys();
      expect(results).toBeDefined();
      expect(results).toMatchObject({
        offset: 0,
        count: 2,
      });
      expect(results.items[0].name).toBe('testKey');
      expect(results.items[1].name).toBe('testKey2');
    });

    it('finds host keys for a service', async () => {
      const cluster = await store.saveCluster(makeCluster(), makeRootMeta());
      const cluster2 = await store.saveCluster(makeCluster(), makeRootMeta());
      const namespace = await store.saveNamespace(makeNamespace({ cluster }), makeRootMeta());
      const release = await store.saveRelease(makeRelease({ service: { name: 'app-1' } }), makeRootMeta(), makeRootMeta());
      await store.enableServiceForNamespace(namespace, release.service, makeRootMeta());

      const testKeyId = await store.saveIngressHostKey('testKey', makeRootMeta());
      const testKey2Id = await store.saveIngressHostKey('testKey2', makeRootMeta());
      await store.saveClusterIngressHostValue({id: testKeyId }, cluster, 'testVal', makeRootMeta());
      await store.saveClusterIngressHostValue({id: testKey2Id }, cluster2, 'testVal', makeRootMeta());

      const results = await store.findIngressHostKeys({ service: release.service });
      expect(results).toBeDefined();
      expect(results).toMatchObject({
        offset: 0,
        count: 1,
      });
      expect(results.items[0].name).toBe('testKey');
    });
  });

  describe('Ingress variable key', () => {
    it('saves a variable key and gets it by id', async () => {
      const id = await store.saveIngressVariableKey('testVarKey', makeRootMeta());
      const variableKey = await store.getIngressVariableKey(id);
      expect(variableKey.name).toBe('testVarKey');
    });

    it('finds host variables', async () => {
      await store.saveIngressVariableKey('testKey', makeRootMeta());
      await store.saveIngressVariableKey('testKey2', makeRootMeta());

      const results = await store.findIngressVariableKeys();
      expect(results).toBeDefined();
      expect(results).toMatchObject({
        offset: 0,
        count: 2,
      });
      expect(results.items[0].name).toBe('testKey');
      expect(results.items[1].name).toBe('testKey2');
    });

    it('finds host keys for a service', async () => {
      const cluster = await store.saveCluster(makeCluster(), makeRootMeta());
      const cluster2 = await store.saveCluster(makeCluster(), makeRootMeta());
      const namespace = await store.saveNamespace(makeNamespace({ cluster }), makeRootMeta());
      const release = await store.saveRelease(makeRelease({ service: { name: 'app-1' } }), makeRootMeta(), makeRootMeta());
      await store.enableServiceForNamespace(namespace, release.service, makeRootMeta());

      const testKeyId = await store.saveIngressVariableKey('testKey', makeRootMeta());
      const testKey2Id = await store.saveIngressVariableKey('testKey2', makeRootMeta());
      await store.saveClusterIngressVariableValue({id: testKeyId }, cluster, 'testVal', makeRootMeta());
      await store.saveClusterIngressVariableValue({id: testKey2Id }, cluster2, 'testVal', makeRootMeta());

      const results = await store.findIngressVariableKeys({ service: release.service });
      expect(results).toBeDefined();
      expect(results).toMatchObject({
        offset: 0,
        count: 1,
      });
      expect(results.items[0].name).toBe('testKey');
    });
  });

  describe('Ingress class', () => {
    it('saves an ingress class and gets it by id', async () => {
      const id = await store.saveIngressClass('testClass', makeRootMeta());
      const variableClass = await store.getIngressClass(id);
      expect(variableClass.name).toBe('testClass');
    });

    it('finds ingress classes', async () => {
      await store.saveIngressClass('testClass', makeRootMeta());
      await store.saveIngressClass('testClass2', makeRootMeta());

      const results = await store.findIngressClasses();
      expect(results).toBeDefined();
      expect(results).toMatchObject({
        offset: 0,
        count: 2,
      });
      expect(results.items[0].name).toBe('testClass');
      expect(results.items[1].name).toBe('testClass2');
    });

    it('finds ingress classes for a service', async () => {
      const cluster = await store.saveCluster(makeCluster(), makeRootMeta());
      const cluster2 = await store.saveCluster(makeCluster(), makeRootMeta());
      const namespace = await store.saveNamespace(makeNamespace({ cluster }), makeRootMeta());
      const release = await store.saveRelease(makeRelease({ service: { name: 'app-1' } }), makeRootMeta(), makeRootMeta());
      await store.enableServiceForNamespace(namespace, release.service, makeRootMeta());

      const testClassId = await store.saveIngressClass('testClass', makeRootMeta());
      const testClass2Id = await store.saveIngressClass('testClass2', makeRootMeta());
      await store.saveClusterIngressClass({id: testClassId }, cluster, makeRootMeta());
      await store.saveClusterIngressClass({id: testClass2Id }, cluster2, makeRootMeta());

      const results = await store.findIngressClasses({ service: release.service });
      expect(results).toBeDefined();
      expect(results).toMatchObject({
        offset: 0,
        count: 1,
      });
      expect(results.items[0].name).toBe('testClass');
    });
  });

  describe('Cluster Ingress Host Value', () => {
    it('saves a cluster host value against a key and retrieves it', async () => {
      const cluster = await store.saveCluster(makeCluster(), makeRootMeta());
      const hostKeyId = await store.saveIngressHostKey('testKey', makeRootMeta());
      const id = await store.saveClusterIngressHostValue({id: hostKeyId }, cluster, 'testVal', makeRootMeta());
      const value = await store.getClusterIngressHost(id);
      expect(value.value).toBe('testVal');
      expect(value.cluster.id).toBe(cluster.id);
      expect(value.ingressHostKey.id).toBe(hostKeyId);
    });
  });

  describe('Cluster Ingress Variable Value', () => {
    it('saves a cluster variable value against a key and retrieves it', async () => {
      const cluster = await store.saveCluster(makeCluster(), makeRootMeta());
      const variableKeyId = await store.saveIngressVariableKey('testKey', makeRootMeta());
      const id = await store.saveClusterIngressVariableValue({id: variableKeyId }, cluster, 'testVal', makeRootMeta());
      const value = await store.getClusterIngressVariable(id);
      expect(value.value).toBe('testVal');
      expect(value.cluster.id).toBe(cluster.id);
      expect(value.ingressVariableKey.id).toBe(variableKeyId);
    });
  });

  describe('Cluster Ingress Class', () => {
    it('saves an ingress class against a cluster and retrieves it', async () => {
      const cluster = await store.saveCluster(makeCluster(), makeRootMeta());
      const classId = await store.saveIngressClass('testClass', makeRootMeta());
      const id = await store.saveClusterIngressClass({id: classId }, cluster, makeRootMeta());
      const value = await store.getClusterIngressClass(id);
      expect(value.cluster.id).toBe(cluster.id);
      expect(value.ingressClass.id).toBe(classId);
    });
  });
});

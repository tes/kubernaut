import bodyParser from 'body-parser';
import Boom from 'boom';
import { customAlphabet } from 'nanoid';
// import { get as _get, reduce as _reduce } from 'lodash';
import { parseAndValidate } from './lib/ingressTemplating';
const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 16);

const systemProvidedTemplateVariables = [
  'service',
];

export default function() {
  function start({ app, store, auth, kubernetes, logger }, cb) {
    app.use('/api/ingress', auth('api'));

    app.get('/api/ingress/host-keys', async (req, res, next) => {
      try {
        if (! await store.hasPermission(req.user, 'ingress-read')) return next(Boom.forbidden());
        const criteria = {};

        if (req.query.serviceId) {
          const service = await store.getService(req.query.serviceId);
          if (! await store.hasPermissionOnRegistry(req.user, service.registry.id, 'registries-read'))  return next(Boom.forbidden());

          criteria.service = service;
        }

        const meta = { date: new Date(), account: req.user };
        await store.audit(meta, 'viewed ingress host keys');
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
        const offset = req.query.offset ? parseInt(req.query.offset, 10) : undefined;

        const result = await store.findIngressHostKeys(criteria, limit, offset);
        res.json(result);
      } catch (err) {
        next(err);
      }
    });

    app.post('/api/ingress/host-keys', bodyParser.json(), async (req, res, next) => {
      try {
        if (! await store.hasPermission(req.user, 'ingress-admin')) return next(Boom.forbidden());

        const { name } = req.body;
        if (!name) return next(Boom.badRequest());

        const meta = { date: new Date(), account: req.user };
        const newId = await store.saveIngressHostKey(name, meta);

        await store.audit(meta, 'added ingress host key');

        res.json(newId);
      } catch (err) {
        next(err);
      }
    });

    app.get('/api/ingress/variable-keys', async (req, res, next) => {
      try {
        if (! await store.hasPermission(req.user, 'ingress-read')) return next(Boom.forbidden());
        const criteria = {};

        if (req.query.serviceId) {
          const service = await store.getService(req.query.serviceId);
          if (! await store.hasPermissionOnRegistry(req.user, service.registry.id, 'registries-read'))  return next(Boom.forbidden());

          criteria.service = service;
        }

        const meta = { date: new Date(), account: req.user };
        await store.audit(meta, 'viewed ingress variable keys');
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
        const offset = req.query.offset ? parseInt(req.query.offset, 10) : undefined;

        const result = await store.findIngressVariableKeys(criteria, limit, offset);
        res.json(result);
      } catch (err) {
        next(err);
      }
    });

    app.post('/api/ingress/variable-keys', bodyParser.json(), async (req, res, next) => {
      try {
        if (! await store.hasPermission(req.user, 'ingress-admin')) return next(Boom.forbidden());

        const { name } = req.body;
        if (!name) return next(Boom.badRequest());

        const meta = { date: new Date(), account: req.user };
        const newId = await store.saveIngressVariableKey(name, meta);

        await store.audit(meta, 'added ingress variable key');

        res.json(newId);
      } catch (err) {
        next(err);
      }
    });

    app.get('/api/ingress/classes', async (req, res, next) => {
      try {
        if (! await store.hasPermission(req.user, 'ingress-read')) return next(Boom.forbidden());
        const criteria = {};

        if (req.query.serviceId) {
          const service = await store.getService(req.query.serviceId);
          if (! await store.hasPermissionOnRegistry(req.user, service.registry.id, 'registries-read'))  return next(Boom.forbidden());

          criteria.service = service;
        }

        const meta = { date: new Date(), account: req.user };
        await store.audit(meta, 'viewed ingress classes');
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
        const offset = req.query.offset ? parseInt(req.query.offset, 10) : undefined;

        const result = await store.findIngressClasses(criteria, limit, offset);
        res.json(result);
      } catch (err) {
        next(err);
      }
    });

    app.post('/api/ingress/classes', bodyParser.json(), async (req, res, next) => {
      try {
        if (! await store.hasPermission(req.user, 'ingress-admin')) return next(Boom.forbidden());

        const { name } = req.body;
        if (!name) return next(Boom.badRequest());

        const meta = { date: new Date(), account: req.user };
        const newId = await store.saveIngressClass(name, meta);

        await store.audit(meta, 'added ingress class');

        res.json(newId);
      } catch (err) {
        next(err);
      }
    });

    app.get('/api/ingress/cluster/:id/hosts', async (req, res, next) => {
      try {
        if (! await store.hasPermission(req.user, 'ingress-read')) return next(Boom.forbidden());
        const cluster = await store.getCluster(req.params.id);
        if (!cluster) return next(Boom.notFound());

        const meta = { date: new Date(), account: req.user };
        await store.audit(meta, 'viewed ingress host values for cluster', { cluster });
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
        const offset = req.query.offset ? parseInt(req.query.offset, 10) : undefined;

        const result = await store.findClusterIngressHosts({ cluster: cluster.id }, limit, offset);
        res.json(result);
      } catch (err) {
        next(err);
      }
    });

    app.post('/api/ingress/cluster/:id/hosts', bodyParser.json(), async (req, res, next) => {
      try {
        if (! await store.hasPermission(req.user, 'ingress-admin')) return next(Boom.forbidden());

        const { value, ingressHostKeyId } = req.body;
        if (!value || !ingressHostKeyId) return next(Boom.badRequest());

        const cluster = await store.getCluster(req.params.id);
        if (!cluster) return next(Boom.notFound());

        const ingressHostKey = await store.getIngressHostKey(ingressHostKeyId);
        if (!ingressHostKey) return next(Boom.notFound());

        const clusterIngressVariables = await store.findClusterIngressVariables({ cluster: cluster.id });
        const templatingVariables = systemProvidedTemplateVariables.concat(clusterIngressVariables.items.map(civ => (civ.ingressVariableKey.name)));
        try {
          parseAndValidate(value, templatingVariables);
        } catch (templateErr) {
          return next(Boom.badRequest(templateErr.message));
        }

        const meta = { date: new Date(), account: req.user };
        const newId = await store.saveClusterIngressHostValue(ingressHostKey, cluster, value, meta);

        await store.audit(meta, 'added cluster ingress host value', { cluster });

        res.json(newId);
      } catch (err) {
        next(err);
      }
    });

    app.put('/api/ingress/cluster/hosts/:id', bodyParser.json(), async (req, res, next) => {
      try {
        if (! await store.hasPermission(req.user, 'ingress-admin')) return next(Boom.forbidden());

        const { value } = req.body;
        if (!value ) return next(Boom.badRequest());

        const clusterIngressHost = await store.getClusterIngressHost(req.params.id);
        if (!clusterIngressHost) return next(Boom.notFound());

        const clusterIngressVariables = await store.findClusterIngressVariables({ cluster: clusterIngressHost.cluster.id });
        const templatingVariables = systemProvidedTemplateVariables.concat(clusterIngressVariables.items.map(civ => (civ.ingressVariableKey.name)));
        try {
          parseAndValidate(value, templatingVariables);
        } catch (templateErr) {
          return next(Boom.badRequest(templateErr.message));
        }

        const meta = { date: new Date(), account: req.user };
        const newId = await store.updateClusterIngressHostValue(clusterIngressHost.id, value);

        await store.audit(meta, 'updated cluster ingress host value');

        res.json(newId);
      } catch (err) {
        next(err);
      }
    });

    app.get('/api/ingress/cluster/:id/variables', async (req, res, next) => {
      try {
        if (! await store.hasPermission(req.user, 'ingress-read')) return next(Boom.forbidden());
        const cluster = await store.getCluster(req.params.id);
        if (!cluster) return next(Boom.notFound());

        const meta = { date: new Date(), account: req.user };
        await store.audit(meta, 'viewed ingress variable values for cluster', { cluster });
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
        const offset = req.query.offset ? parseInt(req.query.offset, 10) : undefined;

        const result = await store.findClusterIngressVariables({ cluster: cluster.id }, limit, offset);
        res.json(result);
      } catch (err) {
        next(err);
      }
    });

    app.post('/api/ingress/cluster/:id/variables', bodyParser.json(), async (req, res, next) => {
      try {
        if (! await store.hasPermission(req.user, 'ingress-admin')) return next(Boom.forbidden());

        const { value, ingressVariableKeyId } = req.body;
        if (!value || !ingressVariableKeyId) return next(Boom.badRequest());

        const cluster = await store.getCluster(req.params.id);
        if (!cluster) return next(Boom.notFound());

        const ingressVariableKey = await store.getIngressVariableKey(ingressVariableKeyId);
        if (!ingressVariableKey) return next(Boom.notFound());

        const meta = { date: new Date(), account: req.user };
        const newId = await store.saveClusterIngressVariableValue(ingressVariableKey, cluster, value, meta);

        await store.audit(meta, 'added cluster ingress variable value', { cluster });

        res.json(newId);
      } catch (err) {
        next(err);
      }
    });

    app.put('/api/ingress/cluster/variables/:id', bodyParser.json(), async (req, res, next) => {
      try {
        if (! await store.hasPermission(req.user, 'ingress-admin')) return next(Boom.forbidden());

        const { value } = req.body;
        if (!value ) return next(Boom.badRequest());

        const clusterIngressVariable = await store.getClusterIngressVariable(req.params.id);
        if (!clusterIngressVariable) return next(Boom.notFound());

        const meta = { date: new Date(), account: req.user };
        const newId = await store.updateClusterIngressVariableValue(clusterIngressVariable.id, value);

        await store.audit(meta, 'updated cluster ingress variable value');

        res.json(newId);
      } catch (err) {
        next(err);
      }
    });

    app.get('/api/ingress/cluster/:id/classes', async (req, res, next) => {
      try {
        if (! await store.hasPermission(req.user, 'ingress-read')) return next(Boom.forbidden());
        const cluster = await store.getCluster(req.params.id);
        if (!cluster) return next(Boom.notFound());

        const meta = { date: new Date(), account: req.user };
        await store.audit(meta, 'viewed ingress classes for cluster', { cluster });
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
        const offset = req.query.offset ? parseInt(req.query.offset, 10) : undefined;

        const result = await store.findClusterIngressClasses({ cluster: cluster.id }, limit, offset);
        res.json(result);
      } catch (err) {
        next(err);
      }
    });

    app.post('/api/ingress/cluster/:id/classes', bodyParser.json(), async (req, res, next) => {
      try {
        if (! await store.hasPermission(req.user, 'ingress-admin')) return next(Boom.forbidden());

        const { ingressClassId } = req.body;
        if (!ingressClassId) return next(Boom.badRequest());

        const cluster = await store.getCluster(req.params.id);
        if (!cluster) return next(Boom.notFound());

        const ingressClass = await store.getIngressClass(ingressClassId);
        if (!ingressClass) return next(Boom.notFound());

        const meta = { date: new Date(), account: req.user };
        const newId = await store.saveClusterIngressClass(ingressClass, cluster, meta);

        await store.audit(meta, 'added cluster ingress class', { cluster });

        res.json(newId);
      } catch (err) {
        next(err);
      }
    });

    app.get('/api/ingress/:serviceId/versions', async (req, res, next) => {
      try {
        if (! await store.hasPermission(req.user, 'ingress-read')) return next(Boom.forbidden());
        const service = await store.getService(req.params.serviceId);
        if (!service) return next(Boom.notFound());

        const meta = { date: new Date(), account: req.user };
        await store.audit(meta, 'viewed ingress versions for service', { service });
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
        const offset = req.query.offset ? parseInt(req.query.offset, 10) : undefined;

        const result = await store.findIngressVersions({ service }, limit, offset);
        res.json(result);
      } catch (err) {
        next(err);
      }
    });

    app.post('/api/ingress/:serviceId/versions', bodyParser.json(), async (req, res, next) => {
      try {
        if (! await store.hasPermission(req.user, 'ingress-write')) return next(Boom.forbidden());

        const service = await store.getService(req.params.serviceId);
        if (!service) return next(Boom.notFound());

        if (! await store.hasPermissionOnRegistry(req.user, service.registry.id, 'registries-read'))  return next(Boom.forbidden());

        const versionData = {};
        versionData.comment = req.body.comment;
        versionData.entries = (req.body.entries || []).reduce((acc, entry = {}) => {
          const newEntry = {};
          newEntry.name = entry.name || `${service.name}-${nanoid()}`;

          if (!entry.ingressClass) return acc;
          newEntry.ingressClass = entry.ingressClass;

          newEntry.annotations = (entry.annotations || []).reduce((aAcc, { name, value } = {}) => {
            if (!name || !value) return aAcc;
            aAcc.push({ name, value });
            return aAcc;
          }, []);

          newEntry.rules = (entry.rules || []).reduce((rAcc, rule) => {
            const newRule = {};

            newRule.port = rule.port || '80';

            if (!rule.path) return rAcc;
            newRule.path = rule.path;

            if (rule.customHost) {
              newRule.customHost = rule.customHost;
            } else if (rule.host) {
              newRule.ingressHostKey = rule.host;
            }

            rAcc.push(newRule);
            return rAcc;
          }, []);

          acc.push(newEntry);
          return acc;
        }, []);

        if (!versionData.comment) return next(Boom.badRequest('Comment is required.'));
        for (const entry of versionData.entries) {
          if (!entry.ingressClass) return next(Boom.badRequest('Ingress class is required.'));
          const serviceClasses = await store.findIngressClasses({ service });
          const ingressClassOk = serviceClasses.items.filter(({ id }) => entry.ingressClass).length > 0;
          if (!ingressClassOk) return next(Boom.badRequest('Ingress class selected is not available.'));

          for (const rule of entry.rules) {
            if (!rule.port) return next(Boom.badRequest('Port is required.'));
            if (!rule.path) return next(Boom.badRequest('Port is required.'));
            if (rule.ingressHostKey) {
              const serviceHostKeys = await store.findIngressHostKeys({ service });
              const ingressHostKeyOk = serviceHostKeys.items.filter(({ id }) => rule.ingressHostKey).length > 0;
              if (!ingressHostKeyOk) return next(Boom.badRequest('Ingress host selected is not available.'));
            }
            if (rule.customHost) {
              const serviceVariableKeys = await store.findIngressVariableKeys({ service });
              const templatingVariables = systemProvidedTemplateVariables.concat(serviceVariableKeys.items.map(ivk => (ivk.name)));
              try {
                parseAndValidate(rule.customHost, templatingVariables);
              } catch (templateErr) {
                return next(Boom.badRequest(templateErr.message));
              }
            }
          }
        }

        const meta = { date: new Date(), account: req.user };
        const newId = await store.saveIngressVersion(service, versionData, meta);

        await store.audit(meta, 'saved ingress version for service', { service });

        res.json(newId);
      } catch (err) {
        next(err);
      }
    });

    app.get('/api/ingress/:serviceId/versions/:id', async (req, res, next) => {
      try {
        if (! await store.hasPermission(req.user, 'ingress-read')) return next(Boom.forbidden());
        const service = await store.getService(req.params.serviceId);
        if (!service) return next(Boom.notFound());

        const ingressVersion = await store.getIngressVersion(req.params.id);
        if (!ingressVersion) return next(Boom.notFound());

        const meta = { date: new Date(), account: req.user };
        await store.audit(meta, 'viewed ingress version for service', { service });

        res.json(ingressVersion);
      } catch (err) {
        next(err);
      }
    });

    app.post('/api/ingress/validateCustomHost/:serviceId', bodyParser.json(), async (req, res, next) => {
      try {
        if (! await store.hasPermission(req.user, 'ingress-read')) return next(Boom.forbidden());
        const service = await store.getService(req.params.serviceId);
        if (!service) return next(Boom.notFound());

        if (!req.body.value) return res.json({});

        const serviceVariableKeys = await store.findIngressVariableKeys({ service });
        const templatingVariables = systemProvidedTemplateVariables.concat(serviceVariableKeys.items.map(ivk => (ivk.name)));
        try {
          parseAndValidate(req.body.value, templatingVariables);
        } catch (templateErr) {
          return res.json({ error: templateErr.message });
        }

        res.json({});
      } catch (err) {
        next(err);
      }
    });


    cb();
  }

  return {
    start,
  };
}

import Boom from 'boom';
import { idTypes as auditIdTypes } from '../../domain/AuditEntry';
import parseFilters from './lib/parseFilters';

export default function(options = {}) {
  function start({ app, store, auth }, cb) {
    app.use('/api/audit', auth('api'));

    const auditTypeStoreLookup = {
      secretVersion: store.getVersionOfSecretById, // getVersionOfSecretById(id, meta)
      namespace: store.getNamespace, // getNamespace(id)
      service: store.getService, // getService(id)
      release: store.getRelease, // getRelease(id)
      deployment: store.getDeployment, // getDeployment(id)
      account: store.getAccount, // getAccount(id)
      cluster: store.getCluster, // getCluster
      registry: store.getRegistry, // getRegistry(id)
      team: store.getTeam, // getTeam(id)
      job: store.getJob, // getJob(id)
      jobVersion: store.getJobVersion, // getJobVersion(id)
    };
    const getAuditTypeStoreFunc = (type, id, meta) => {
      if (type === 'secretVersion') return auditTypeStoreLookup[type](id, meta);
      return auditTypeStoreLookup[type](id);
    };
    async function tagAudits(audits, meta) {
      const enrichedItems = audits.items;
      const cache = auditIdTypes.reduce((acc, type) => ({ ...acc, [type]: {} }), {});

      for (const audit of enrichedItems) {
        for (const idType of Object.keys(audit.ids)) {
          const id = audit.ids[idType];
          if (!id) continue;
          if (cache[idType][id]) {
            audit[idType] = cache[idType][id];
            continue;
          }

          let result = await getAuditTypeStoreFunc(idType, id, meta);
          if (!result) result = {
            id,
            name: '[deleted]',
            deleted: true,
          };
          cache[idType][id] = result;
          audit[idType] = result;
        }
      }
      return {
        ...audits,
        items: enrichedItems
      };
    }

    app.get('/api/audit', async (req, res, next) => {
      try {
        const userSystemRoles = await store.rolesForSystem(req.user.id, req.user);
        if (!userSystemRoles.currentRoles.find(r => (r.name === 'admin' && r.global))) return next(Boom.forbidden());

        const meta = { date: new Date(), account: req.user };
        // await store.audit(meta, 'viewed audit');

        const filters = parseFilters(req.query, ['sourceAccount', 'secretVersion', 'namespace', 'service', 'release', 'deployment', 'account', 'cluster', 'registry', 'team', 'job', 'jobVersion']);

        const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
        const offset = req.query.offset ? parseInt(req.query.offset, 10) : undefined;

        const result = await store.findAudits({ filters }, limit, offset);
        const enrichedResult = await tagAudits(result, meta);
        res.json(enrichedResult);
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

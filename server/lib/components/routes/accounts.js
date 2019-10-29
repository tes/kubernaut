import bodyParser from 'body-parser';
import Boom from 'boom';
import parseFilters from './lib/parseFilters';

export default function(options = {}) {

  function start({ pkg, app, loggerMiddleware, store, auth }, cb) {

    app.use('/api/account', auth('api'));
    app.use('/api/accounts', auth('api'));
    app.use('/api/identities', auth('api'));
    app.use('/api/roles', auth('api'));

    app.get('/api/account', async (req, res, next) => {
      try {
        const account = await store.getAccount(req.user.id);
        res.json(account);
      } catch (err) {
          next(err);
      }
    });

    app.get('/api/accounts', async (req, res, next) => {
      try {
        if (! await store.hasPermission(req.user, 'accounts-read')) return next(Boom.forbidden());
        const meta = { date: new Date(), account: req.user };
        await store.audit(meta, 'viewed accounts');
        const filters = parseFilters(req.query, ['name', 'createdBy']);
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
        const offset = req.query.offset ? parseInt(req.query.offset, 10) : undefined;
        const sort = req.query.sort ? req.query.sort : 'name';
        const order = req.query.order ? req.query.order : 'asc';
        const result = await store.findAccounts({ filters }, limit, offset, sort, order);
        res.json(result);
      } catch (err) {
        next(err);
      }
    });

    app.get('/api/account/hasPermission/:permission', async (req, res, next) => {
      try {
          const { permission } = req.params;
          const answer = await store.hasPermission(req.user, permission);
          return res.json({ answer });
      } catch (err) {
        next(err);
      }
    });

    app.get('/api/account/hasPermission/:permission/on/:type/:id', async (req, res, next) => {
      try {
          const { permission, type, id } = req.params;
          if (!['namespace', 'registry', 'team'].includes(type)) return next(Boom.badRequest(`Type ${type} is not supported`));
          const func = ({
            namespace: store.hasPermissionOnNamespace,
            registry: store.hasPermissionOnRegistry,
            team: store.hasPermissionOnTeam,
          })[type];

          const answer = await func(req.user, id, permission);
          return res.json({ answer });
      } catch (err) {
        next(err);
      }
    });

    app.get('/api/account/hasPermission/:permission/on-any/:type', async(req, res, next) => {
      try {
          const { permission, type } = req.params;
          if (!['namespace', 'registry', 'team'].includes(type)) return next(Boom.badRequest(`Type ${type} is not supported`));

          const answer = await store.hasPermissionOnAnyOfSubjectType(req.user, type, permission);
          return res.json({ answer });
      } catch (err) {
        next(err);
      }
    });

    app.get('/api/account/withPermission/:permission/on/:type', async (req, res, next) => {
      try {
          const { permission, type } = req.params;
          if (!['team'].includes(type)) return next(Boom.badRequest(`Type ${type} is not supported`));
          const func = ({
            team: store.teamsWithPermission,
          })[type];

          const answer = await func(req.user, permission);
          return res.json(answer);
      } catch (err) {
        next(err);
      }
    });

    app.get('/api/accounts/:id', async (req, res, next) => {
      try {
        if (! (req.user.hasPermissionOnAccount(req.params.id) || await store.hasPermission(req.user, 'accounts-read'))) return next(Boom.forbidden());
        const account = await store.getAccount(req.params.id);
        if (!account) return next();
        const meta = { date: new Date(), account: req.user };
        await store.audit(meta, 'viewed account', { account });
        const accountRoles = await store.getRolesForAccount(req.params.id, req.user);
        account.roles = accountRoles;
        res.json(account);
      } catch (err) {
        next(err);
      }
    });

    app.post('/api/accounts', bodyParser.json(), async (req, res, next) => {
      try {
        if (!req.body.displayName) return next(Boom.badRequest('displayName is required'));
        const data = { displayName: req.body.displayName };
        const meta = { date: new Date(), account: { id: req.user.id } };
        const account = await store.saveAccount(data, meta);
        await store.audit(meta, 'saved account', { account });
        res.json(account);
      } catch (err) {
        next(err);
      }
    });

    app.delete('/api/accounts/:id', async (req, res, next) => {
      try {
        if (! (req.user.hasPermissionOnAccount(req.params.id) || await store.hasPermission(req.user, 'accounts-delete'))) return next(Boom.forbidden());
        const account = await store.getAccount(req.params.id);
        if (!account) return next();
        const meta = { date: new Date(), account: { id: req.user.id } };
        await store.deleteAccount(req.params.id, meta);
        await store.audit(meta, 'deleted account', { account });
        res.status(204).send();
      } catch (err) {
        next(err);
      }
    });

    app.post('/api/identities', bodyParser.json(), async (req, res, next) => {
      try {
        if (!req.body.account) return next(Boom.badRequest('account is required'));
        if (!req.body.name) return next(Boom.badRequest('name is required'));
        if (!req.body.provider) return next(Boom.badRequest('provider is required'));
        if (!req.body.type) return next(Boom.badRequest('type is required'));

        if (! (req.user.hasPermissionOnAccount(req.params.id) || await store.hasPermission(req.user, 'accounts-write'))) return next(Boom.forbidden());

        const account = await store.getAccount(req.body.account);
        if (!account) return next();

        const data = { name: req.body.name, provider: req.body.provider, type: req.body.type };
        const meta = { date: new Date(), account: { id: req.user.id } };
        const identity = await store.saveIdentity(req.body.account, data, meta);
        await store.audit(meta, 'added identity to account', { account });

        res.json(identity);
      } catch (err) {
        next(err);
      }
    });

    app.post('/api/roles/system', bodyParser.json(), async (req, res, next) => {
      try {
        if (!req.body.account) return next(Boom.badRequest('account is required'));
        if (!req.body.role) return next(Boom.badRequest('role is required'));

        if (! await store.hasPermission(req.user, 'accounts-write')) return next(Boom.forbidden());
        const account = await store.getAccount(req.body.account);
        if (!account) return next();

        const meta = { date: new Date(), account: { id: req.user.id } };
        const canGrantSystem = await store.checkCanGrantSystem(req.body.role, meta);
        if (!canGrantSystem) return next(Boom.forbidden());

        await store.grantSystemRole(req.body.account, req.body.role, meta);
        await store.audit(meta, `added system role [${req.body.role}] to account`, { account });
        const data = await store.rolesForSystem(req.body.account, req.user);
        res.json(data);
      } catch (err) {
        next(err);
      }
    });

    app.delete('/api/roles/system', bodyParser.json(), async (req, res, next) => {
      try {
        if (!req.body.account) return next(Boom.badRequest('account is required'));
        if (!req.body.role) return next(Boom.badRequest('role is required'));

        if (! await store.hasPermission(req.user, 'accounts-write')) return next(Boom.forbidden());
        const account = await store.getAccount(req.body.account);
        if (!account) return next();

        const meta = { date: new Date(), account: { id: req.user.id } };
        const canRevokeSystem = await store.checkCanRevokeSystem(req.body.role, meta);
        if (!canRevokeSystem) return next(Boom.forbidden());

        const currentRoles = await store.rolesForSystem(req.body.account, req.user);
        const roleToRevoke = currentRoles.currentRoles.find(({ name }) => name === req.body.role);
        if (!roleToRevoke) return next(Boom.badRequest());

        if (roleToRevoke.global) {
          const canRevokeGlobal = await store.checkCanRevokeGlobal(req.body.account, req.body.role, meta);
          if (!canRevokeGlobal) return next(Boom.forbidden());
        }

        await store.revokeSystemRole(req.body.account, req.body.role, meta);
        await store.audit(meta, `deleted system role [${req.body.role}] from account`, { account });
        const data = await store.rolesForSystem(req.body.account, req.user);
        res.json(data);
      } catch (err) {
        next(err);
      }
    });

    app.post('/api/roles/global', bodyParser.json(), async (req, res, next) => {
      try {
        if (!req.body.account) return next(Boom.badRequest('account is required'));
        if (!req.body.role) return next(Boom.badRequest('role is required'));
        if (req.user.id === req.body.account) return next(Boom.badRequest('cannot set your own global'));

        if (! await store.hasPermission(req.user, 'accounts-write')) return next(Boom.forbidden());
        const account = await store.getAccount(req.body.account);
        if (!account) return next();

        const meta = { date: new Date(), account: { id: req.user.id } };
        const canGrantGlobal = await store.checkCanGrantGlobal(req.body.account, req.body.role, meta);
        if (!canGrantGlobal) return next(Boom.forbidden());

        await store.grantGlobalRole(req.body.account, req.body.role, meta);
        const data = await store.rolesForSystem(req.body.account, req.user);
        await store.audit(meta, `added global role [${req.body.role}] to account`, { account });
        res.json(data);
      } catch (err) {
        next(err);
      }
    });

    app.delete('/api/roles/global', bodyParser.json(), async (req, res, next) => {
      try {
        if (!req.body.account) return next(Boom.badRequest('account is required'));
        if (!req.body.role) return next(Boom.badRequest('role is required'));

        if (! await store.hasPermission(req.user, 'accounts-write')) return next(Boom.forbidden());
        const account = await store.getAccount(req.body.account);
        if (!account) return next();

        const meta = { date: new Date(), account: { id: req.user.id } };
        const canRevokeGlobal = await store.checkCanRevokeGlobal(req.body.account, req.body.role, meta);
        if (!canRevokeGlobal) return next(Boom.forbidden());

        await store.revokeGlobalRole(req.body.account, req.body.role, meta);
        const data = await store.rolesForSystem(req.body.account, req.user);
        await store.audit(meta, `deleted global role [${req.body.role}] from account`, { account });
        res.json(data);
      } catch (err) {
        next(err);
      }
    });

    app.post('/api/roles/registry', bodyParser.json(), async (req, res, next) => {
      try {
        if (!req.body.account) return next(Boom.badRequest('account is required'));
        if (!req.body.role) return next(Boom.badRequest('role is required'));
        if (!req.body.registry) return next(Boom.badRequest('registry is required'));

        if (! await store.hasPermissionOnRegistry(req.user, req.body.registry, 'registries-grant')) return next(Boom.forbidden());
        const account = await store.getAccount(req.body.account);
        if (!account) return next();

        const meta = { date: new Date(), account: { id: req.user.id } };
        await store.grantRoleOnRegistry(req.body.account, req.body.role, req.body.registry, meta);
        const data = await store.rolesForRegistries(req.body.account, req.user);
        await store.audit(meta, `added role [${req.body.role}] for registry to account`, {
          account,
          registry: { id: req.body.registry },
        });
        res.json(data);
      } catch (err) {
        next(err);
      }
    });

    app.delete('/api/roles/registry', bodyParser.json(), async (req, res, next) => {
      try {
        if (!req.body.account) return next(Boom.badRequest('account is required'));
        if (!req.body.role) return next(Boom.badRequest('role is required'));
        if (!req.body.registry) return next(Boom.badRequest('registry is required'));

        if (! await store.hasPermissionOnRegistry(req.user, req.body.registry, 'registries-grant')) return next(Boom.forbidden());
        const account = await store.getAccount(req.body.account);
        if (!account) return next();

        const meta = { date: new Date(), account: { id: req.user.id } };
        await store.revokeRoleOnRegistry(req.body.account, req.body.role, req.body.registry, meta);
        const data = await store.rolesForRegistries(req.body.account, req.user);
        await store.audit(meta, `deleted role [${req.body.role}] for registry from account`, {
          account,
          registry: { id: req.body.registry },
        });
        res.json(data);
      } catch (err) {
        next(err);
      }
    });

    app.post('/api/roles/namespace', bodyParser.json(), async (req, res, next) => {
      try {
        if (!req.body.account) return next(Boom.badRequest('account is required'));
        if (!req.body.role) return next(Boom.badRequest('role is required'));
        if (!req.body.namespace) return next(Boom.badRequest('namespace is required'));

        if (! await store.hasPermissionOnNamespace(req.user, req.body.namespace, 'namespaces-grant')) return next(Boom.forbidden());
        const account = await store.getAccount(req.body.account);
        if (!account) return next();

        const meta = { date: new Date(), account: { id: req.user.id } };
        await store.grantRoleOnNamespace(req.body.account, req.body.role, req.body.namespace, meta);
        const data = await store.rolesForNamespaces(req.body.account, req.user);
        await store.audit(meta, `added role [${req.body.role}] for namespace to account`, {
          account,
          namespace: { id: req.body.namespace },
        });
        res.json(data);
      } catch (err) {
        next(err);
      }
    });

    app.delete('/api/roles/namespace', bodyParser.json(), async (req, res, next) => {
      try {
        if (!req.body.account) return next(Boom.badRequest('account is required'));
        if (!req.body.role) return next(Boom.badRequest('role is required'));
        if (!req.body.namespace) return next(Boom.badRequest('namespace is required'));

        if (! await store.hasPermissionOnNamespace(req.user, req.body.namespace, 'namespaces-grant')) return next(Boom.forbidden());
        const account = await store.getAccount(req.body.account);
        if (!account) return next();

        const meta = { date: new Date(), account: { id: req.user.id } };
        await store.revokeRoleOnNamespace(req.body.account, req.body.role, req.body.namespace, meta);
        const data = await store.rolesForNamespaces(req.body.account, req.user);
        await store.audit(meta, `deleted role [${req.body.role}] for namespace from account`, {
          account,
          namespace: { id: req.body.namespace },
        });
        res.json(data);
      } catch (err) {
        next(err);
      }
    });

    app.post('/api/roles/team', bodyParser.json(), async (req, res, next) => {
      try {
        if (!req.body.account) return next(Boom.badRequest('account is required'));
        if (!req.body.role) return next(Boom.badRequest('role is required'));
        if (!req.body.team) return next(Boom.badRequest('team is required'));

        if (! await store.hasPermissionOnTeam(req.user, req.body.team, 'teams-manage')) return next(Boom.forbidden());
        const account = await store.getAccount(req.body.account);
        if (!account) return next();

        const meta = { date: new Date(), account: { id: req.user.id } };
        await store.grantRoleOnTeam(req.body.account, req.body.role, req.body.team, meta);
        const data = await store.rolesForTeams(req.body.account, req.user);
        await store.audit(meta, `added role [${req.body.role}] for team to account`, {
          account,
          team: { id: req.body.team },
        });
        res.json(data);
      } catch (err) {
        next(err);
      }
    });

    app.delete('/api/roles/team', bodyParser.json(), async (req, res, next) => {
      try {
        if (!req.body.account) return next(Boom.badRequest('account is required'));
        if (!req.body.role) return next(Boom.badRequest('role is required'));
        if (!req.body.team) return next(Boom.badRequest('team is required'));

        if (! await store.hasPermissionOnTeam(req.user, req.body.team, 'teams-manage')) return next(Boom.forbidden());
        const account = await store.getAccount(req.body.account);
        if (!account) return next();

        const meta = { date: new Date(), account: { id: req.user.id } };
        await store.revokeRoleOnTeam(req.body.account, req.body.role, req.body.team, meta);
        const data = await store.rolesForTeams(req.body.account, req.user);
        await store.audit(meta, `deleted role [${req.body.role}] for team from account`, {
          account,
          team: { id: req.body.team },
        });
        res.json(data);
      } catch (err) {
        next(err);
      }
    });

    app.get('/api/accounts/:id/namespaces', async (req, res, next) => {
      try {
        if (! await store.hasPermission(req.user, 'accounts-read')) return next(Boom.forbidden());
        const data = await store.rolesForNamespaces(req.params.id, req.user);
        res.json(data);
      } catch (error) {
        next(error);
      }
    });

    app.get('/api/accounts/:id/registries', async (req, res, next) => {
      try {
        if (! await store.hasPermission(req.user, 'accounts-read')) return next(Boom.forbidden());
        const data = await store.rolesForRegistries(req.params.id, req.user);
        res.json(data);
      } catch (error) {
        next(error);
      }
    });

    app.get('/api/accounts/:id/system', async (req, res, next) => {
      try {
        if (! await store.hasPermission(req.user, 'accounts-read')) return next(Boom.forbidden());
        const data = await store.rolesForSystem(req.params.id, req.user);
        res.json(data);
      } catch (error) {
        next(error);
      }
    });

    app.get('/api/accounts/:id/teams', async (req, res, next) => {
      try {
        if (! await store.hasPermission(req.user, 'accounts-read')) return next(Boom.forbidden());
        const data = await store.rolesForTeams(req.params.id, req.user);
        res.json(data);
      } catch (error) {
        next(error);
      }
    });

    app.get('/api/accounts/:id/team-membership', async (req, res, next) => {
      try {
        if (! await store.hasPermission(req.user, 'accounts-read')) return next(Boom.forbidden());
        const data = await store.membershipToTeams(req.params.id, req.user);
        res.json(data);
      } catch (error) {
        next(error);
      }
    });

    app.post('/api/roles/team-membership', bodyParser.json(), async (req, res, next) => {
      try {
        if (!req.body.account) return next(Boom.badRequest('account is required'));
        if (!req.body.team) return next(Boom.badRequest('team is required'));

        if (! await store.hasPermissionOnTeam(req.user, req.body.team, 'teams-manage')) return next(Boom.forbidden());
        const team = await store.getTeam(req.body.team);
        if (!team) return next();
        const account = await store.getAccount(req.body.account);
        if (!account) return next();

        const meta = { date: new Date(), account: { id: req.user.id } };
        await store.associateAccountWithTeam(account, team, meta);
        const data = await store.membershipToTeams(req.body.account, req.user);
        await store.audit(meta, `added account to team`, {
          account,
          team,
        });
        res.json(data);
      } catch (err) {
        next(err);
      }
    });

    app.delete('/api/roles/team-membership', bodyParser.json(), async (req, res, next) => {
      try {
        if (!req.body.account) return next(Boom.badRequest('account is required'));
        if (!req.body.team) return next(Boom.badRequest('team is required'));

        if (! await store.hasPermissionOnTeam(req.user, req.body.team, 'teams-manage')) return next(Boom.forbidden());
        const team = await store.getTeam(req.body.team);
        if (!team) return next();
        const account = await store.getAccount(req.body.account);
        if (!account) return next();

        const meta = { date: new Date(), account: { id: req.user.id } };
        await store.disassociateAccount(account, team, meta);
        const data = await store.membershipToTeams(req.body.account, req.user);
        await store.audit(meta, `removed account from team`, {
          account,
          team,
        });
        res.json(data);
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

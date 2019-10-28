import bodyParser from 'body-parser';
import Boom from 'boom';
import parseFilters from './lib/parseFilters';

export default function(options = {}) {
  function start({ app, store, auth }, cb) {
    app.use('/api/teams', auth('api'));

    app.get('/api/teams', async (req, res, next) => {
      try {
        const meta = { date: new Date(), account: req.user };
        await store.audit(meta, 'viewed teams');
        const filters = parseFilters(req.query, ['name', 'createdBy']);
        const criteria = {
          user: { id: req.user.id, permission: 'teams-read' },
          filters,
        };
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
        const offset = req.query.offset ? parseInt(req.query.offset, 10) : undefined;

        const result = await store.findTeams(criteria, limit, offset);
        res.json(result);
      } catch (err) {
        next(err);
      }
    });

    app.get('/api/teams/:id', async (req, res, next) => {
      try {
        const { id } = req.params;
        const team = await store.getTeam(id);
        if (!team) return next(Boom.notFound());
        if (! await store.hasPermissionOnTeam(req.user, team.id, 'teams-read')) return next(Boom.forbidden());

        const meta = { date: new Date(), account: req.user };
        await store.audit(meta, 'viewed team', { team });
        return res.json(team);
      } catch (err) {
        next(err);
      }
    });

    app.get('/api/teams/:id/services', async (req, res, next) => {
      try {
        const { id } = req.params;
        const team = await store.getTeam(id);
        if (!team) return next(Boom.notFound());
        if (! await store.hasPermissionOnTeam(req.user, team.id, 'teams-read')) return next(Boom.forbidden());

        const criteria = {
          user: { id: req.user.id, permission: 'registries-read' },
          team
        };

        const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
        const offset = req.query.offset ? parseInt(req.query.offset, 10) : undefined;

        const result = await store.findServices(criteria, limit, offset);
        const meta = { date: new Date(), account: req.user };
        await store.audit(meta, 'viewed team services', { team });
        return res.json(result);
      } catch (err) {
        next(err);
      }
    });

    app.post('/api/teams/association/service', bodyParser.json(), async (req, res, next) => {
      try {
        const  {
          team: teamId,
          service: serviceId,
        } = req.body;

        if (!teamId) return next(Boom.badRequest('team is required'));
        if (!serviceId) return next(Boom.badRequest('service is required'));

        const team = await store.getTeam(teamId);
        if (!team) return next(Boom.notFound('team does not exist'));
        const service = await store.getService(serviceId);
        if (!service) return next(Boom.notFound('service does not exist'));

        const currentTeam = store.getTeamForService(service);
        if (currentTeam) {
          if (! await store.hasPermissionOnTeam(req.user, currentTeam.id, 'teams-manage')) return next(Boom.forbidden());
        }
        if (! await store.hasPermissionOnTeam(req.user, team.id, 'teams-manage')) return next(Boom.forbidden());

        await store.associateServiceWithTeam(service, team);
        return res.json(await store.getTeam(teamId));
      } catch (err) {
        next(err);
      }
    });

    app.delete('/api/teams/association/service', bodyParser.json(), async (req, res, next) => {
      try {
        const  {
          service: serviceId,
        } = req.body;

        if (!serviceId) return next(Boom.badRequest('service is required'));

        const service = await store.getService(serviceId);
        if (!service) return next(Boom.notFound('service does not exist'));

        const currentTeam = store.getTeamForService(service);
        if (currentTeam) {
          if (! await store.hasPermissionOnTeam(req.user, currentTeam.id, 'teams-manage')) return next(Boom.forbidden());
        }

        await store.disassociateService(service);
        return res.json({});
      } catch (err) {
        next(err);
      }
    });

    app.get('/api/teams/by-name/:name', async (req, res, next) => {
      try {
        const { name } = req.params;
        const criteria = {
          user: { id: req.user.id, permission: 'teams-read' },
          filters: parseFilters({ name }, ['name']),
        };
        const team = await store.findTeam(criteria);
        if (!team) return next(Boom.notFound());
        if (! await store.hasPermissionOnTeam(req.user, team.id, 'teams-read')) return next(Boom.forbidden());

        const meta = { date: new Date(), account: req.user };
        await store.audit(meta, 'viewed team', { team });
        return res.json(team);
      } catch (err) {
        next(err);
      }
    });

    app.get('/api/teams/for/:registry/:service', async (req, res, next) => {
      try {
        const registry = await store.findRegistry({ name: req.params.registry });
        if (!registry) return next(Boom.notFound());
        if (! await store.hasPermissionOnRegistry(req.user, registry.id, 'registries-read')) return next(Boom.forbidden());

        const service = await store.findService({ filters: parseFilters(req.params, ['service', 'registry'], {
          service: 'name'
        }) });
        if (!service) return next(Boom.notFound());

        const team = await store.getTeamForService(service, { id: req.user.id, permission: 'registries-read'});
        if (!team) return next(Boom.notFound());
        if (! await store.hasPermissionOnTeam(req.user, team.id, 'teams-read')) return next(Boom.forbidden());

        const meta = { date: new Date(), account: req.user };
        await store.audit(meta, 'viewed team for service', { team, service });
        return res.json(team);
      } catch (err) {
        next(err);
      }
    });

    app.get('/api/teams/:id/namespaces', async (req, res, next) => {
      try {
        if (! await store.hasPermissionOnTeam(req.user, req.params.id, 'teams-manage')) return next(Boom.forbidden());
        const data = await store.teamRolesForNamespaces(req.params.id, req.user);
        res.json(data);
      } catch (error) {
        next(error);
      }
    });

    app.get('/api/teams/:id/registries', async (req, res, next) => {
      try {
        if (! await store.hasPermissionOnTeam(req.user, req.params.id, 'teams-manage')) return next(Boom.forbidden());
        const data = await store.teamRolesForRegistries(req.params.id, req.user);
        res.json(data);
      } catch (error) {
        next(error);
      }
    });

    app.get('/api/teams/:id/system', async (req, res, next) => {
      try {
        if (! await store.hasPermissionOnTeam(req.user, req.params.id, 'teams-manage')) return next(Boom.forbidden());
        const data = await store.teamRolesForSystem(req.params.id, req.user);
        res.json(data);
      } catch (error) {
        next(error);
      }
    });

    app.get('/api/teams/:id/teams', async (req, res, next) => {
      try {
        if (! await store.hasPermissionOnTeam(req.user, req.params.id, 'teams-manage')) return next(Boom.forbidden());
        const data = await store.teamRolesForTeams(req.params.id, req.user);
        res.json(data);
      } catch (error) {
        next(error);
      }
    });

    app.post('/api/teams/roles/system', bodyParser.json(), async (req, res, next) => {
      try {
        if (!req.body.team) return next(Boom.badRequest('team is required'));
        if (!req.body.role) return next(Boom.badRequest('role is required'));

        const team = await store.getTeam(req.body.team);
        if (!team) return next();
        if (! await store.hasPermissionOnTeam(req.user, req.body.team, 'teams-manage')) return next(Boom.forbidden());

        const meta = { date: new Date(), account: { id: req.user.id } };
        const canGrantSystem = await store.checkCanGrantSystemOnTeam(req.body.role, meta);
        if (!canGrantSystem) return next(Boom.forbidden());

        await store.grantSystemRoleOnTeam(req.body.team, req.body.role, meta);
        await store.audit(meta, `added system role [${req.body.role}] to team`, { team });
        const data = await store.teamRolesForSystem(req.body.team, req.user);
        res.json(data);
      } catch (err) {
        next(err);
      }
    });

    app.post('/api/teams/roles/global', bodyParser.json(), async (req, res, next) => {
      try {
        if (!req.body.team) return next(Boom.badRequest('team is required'));
        if (!req.body.role) return next(Boom.badRequest('role is required'));

        const team = await store.getTeam(req.body.team);
        if (!team) return next();
        if (! await store.hasPermissionOnTeam(req.user, req.body.team, 'teams-manage')) return next(Boom.forbidden());

        const meta = { date: new Date(), account: { id: req.user.id } };
        const canGrantGlobal = await store.checkCanGrantGlobalOnTeam(req.body.role, meta);
        if (!canGrantGlobal) return next(Boom.forbidden());

        await store.grantGlobalRoleOnTeam(req.body.team, req.body.role, meta);
        const data = await store.teamRolesForSystem(req.body.team, req.user);
        await store.audit(meta, `added global role [${req.body.role}] to team`, { team });
        res.json(data);
      } catch (err) {
        next(err);
      }
    });

    app.delete('/api/teams/roles/global', bodyParser.json(), async (req, res, next) => {
      try {
        if (!req.body.team) return next(Boom.badRequest('team is required'));
        if (!req.body.role) return next(Boom.badRequest('role is required'));

        const team = await store.getTeam(req.body.team);
        if (!team) return next();
        if (! await store.hasPermissionOnTeam(req.user, req.body.team, 'teams-manage')) return next(Boom.forbidden());

        const meta = { date: new Date(), account: { id: req.user.id } };
        const canRevokeGlobal = await store.checkCanGrantGlobalOnTeam(req.body.role, meta);
        if (!canRevokeGlobal) return next(Boom.forbidden());

        await store.revokeGlobalRoleFromTeam(req.body.team, req.body.role, meta);
        const data = await store.teamRolesForSystem(req.body.team, req.user);
        await store.audit(meta, `deleted global role [${req.body.role}] from team`, { team });
        res.json(data);
      } catch (err) {
        next(err);
      }
    });

    app.delete('/api/teams/roles/system', bodyParser.json(), async (req, res, next) => {
      try {
        if (!req.body.team) return next(Boom.badRequest('team is required'));
        if (!req.body.role) return next(Boom.badRequest('role is required'));

        const team = await store.getTeam(req.body.team);
        if (!team) return next();
        if (! await store.hasPermissionOnTeam(req.user, req.body.team, 'teams-manage')) return next(Boom.forbidden());

        const meta = { date: new Date(), account: { id: req.user.id } };
        const canRevokeSystem = await store.checkCanGrantSystemOnTeam(req.body.role, meta);
        if (!canRevokeSystem) return next(Boom.forbidden());

        const currentRoles = await store.teamRolesForSystem(req.body.team, req.user);
        const roleToRevoke = currentRoles.currentRoles.find(({ name }) => name === req.body.role);
        if (!roleToRevoke) return next(Boom.badRequest());

        if (roleToRevoke.global) {
          const canRevokeGlobal = await store.checkCanGrantGlobalOnTeam(req.body.team, req.body.role, meta);
          if (!canRevokeGlobal) return next(Boom.forbidden());
        }

        await store.revokeSystemRoleFromTeam(req.body.team, req.body.role, meta);
        await store.audit(meta, `deleted system role [${req.body.role}] from team`, { team });
        const data = await store.teamRolesForSystem(req.body.team, req.user);
        res.json(data);
      } catch (err) {
        next(err);
      }
    });

    app.post('/api/teams/roles/registry', bodyParser.json(), async (req, res, next) => {
      try {
        if (!req.body.team) return next(Boom.badRequest('team is required'));
        if (!req.body.role) return next(Boom.badRequest('role is required'));
        if (!req.body.registry) return next(Boom.badRequest('registry is required'));

        if (! await store.hasPermissionOnRegistry(req.user, req.body.registry, 'registries-grant')) return next(Boom.forbidden());
        if (! await store.hasPermissionOnTeam(req.user, req.body.team, 'teams-manage')) return next(Boom.forbidden());
        const team = await store.getTeam(req.body.team);
        if (!team) return next();

        const meta = { date: new Date(), account: { id: req.user.id } };
        await store.grantRoleOnRegistryOnTeam(req.body.team, req.body.role, req.body.registry, meta);
        const data = await store.teamRolesForRegistries(req.body.team, req.user);
        await store.audit(meta, `added role [${req.body.role}] for registry to team`, {
          team,
          registry: { id: req.body.registry },
        });
        res.json(data);
      } catch (err) {
        next(err);
      }
    });

    app.delete('/api/teams/roles/registry', bodyParser.json(), async (req, res, next) => {
      try {
        if (!req.body.team) return next(Boom.badRequest('team is required'));
        if (!req.body.role) return next(Boom.badRequest('role is required'));
        if (!req.body.registry) return next(Boom.badRequest('registry is required'));

        if (! await store.hasPermissionOnRegistry(req.user, req.body.registry, 'registries-grant')) return next(Boom.forbidden());
        if (! await store.hasPermissionOnTeam(req.user, req.body.team, 'teams-manage')) return next(Boom.forbidden());
        const team = await store.getTeam(req.body.team);
        if (!team) return next();

        const meta = { date: new Date(), account: { id: req.user.id } };
        await store.revokeRoleOnRegistryFromTeam(req.body.team, req.body.role, req.body.registry, meta);
        const data = await store.teamRolesForRegistries(req.body.team, req.user);
        await store.audit(meta, `deleted role [${req.body.role}] for registry from team`, {
          team,
          registry: { id: req.body.registry },
        });
        res.json(data);
      } catch (err) {
        next(err);
      }
    });

    app.post('/api/teams/roles/namespace', bodyParser.json(), async (req, res, next) => {
      try {
        if (!req.body.team) return next(Boom.badRequest('team is required'));
        if (!req.body.role) return next(Boom.badRequest('role is required'));
        if (!req.body.namespace) return next(Boom.badRequest('namespace is required'));

        if (! await store.hasPermissionOnNamespace(req.user, req.body.namespace, 'namespaces-grant')) return next(Boom.forbidden());
        if (! await store.hasPermissionOnTeam(req.user, req.body.team, 'teams-manage')) return next(Boom.forbidden());
        const team = await store.getTeam(req.body.team);
        if (!team) return next();

        const meta = { date: new Date(), account: { id: req.user.id } };
        await store.grantRoleOnNamespaceOnTeam(req.body.team, req.body.role, req.body.namespace, meta);
        const data = await store.teamRolesForNamespaces(req.body.team, req.user);
        await store.audit(meta, `added role [${req.body.role}] for namespace to team`, {
          team,
          namespace: { id: req.body.namespace },
        });
        res.json(data);
      } catch (err) {
        next(err);
      }
    });

    app.delete('/api/teams/roles/namespace', bodyParser.json(), async (req, res, next) => {
      try {
        if (!req.body.team) return next(Boom.badRequest('team is required'));
        if (!req.body.role) return next(Boom.badRequest('role is required'));
        if (!req.body.namespace) return next(Boom.badRequest('namespace is required'));

        if (! await store.hasPermissionOnNamespace(req.user, req.body.namespace, 'namespaces-grant')) return next(Boom.forbidden());
        if (! await store.hasPermissionOnTeam(req.user, req.body.team, 'teams-manage')) return next(Boom.forbidden());
        const team = await store.getTeam(req.body.team);
        if (!team) return next();

        const meta = { date: new Date(), account: { id: req.user.id } };
        await store.revokeRoleOnNamespaceFromTeam(req.body.team, req.body.role, req.body.namespace, meta);
        const data = await store.teamRolesForNamespaces(req.body.team, req.user);
        await store.audit(meta, `deleted role [${req.body.role}] for namespace from team`, {
          team,
          namespace: { id: req.body.namespace },
        });
        res.json(data);
      } catch (err) {
        next(err);
      }
    });

    app.post('/api/teams/roles/team', bodyParser.json(), async (req, res, next) => {
      try {
        if (!req.body.team) return next(Boom.badRequest('team is required'));
        if (!req.body.role) return next(Boom.badRequest('role is required'));
        if (!req.body.subjectTeam) return next(Boom.badRequest('subjectTeam is required'));

        if (! await store.hasPermissionOnTeam(req.user, req.body.team, 'teams-manage')) return next(Boom.forbidden());
        if (! await store.hasPermissionOnTeam(req.user, req.body.subjectTeam, 'teams-manage')) return next(Boom.forbidden());
        const team = await store.getTeam(req.body.team);
        if (!team) return next();

        const meta = { date: new Date(), account: { id: req.user.id } };
        await store.grantRoleOnTeamForTeam(req.body.team, req.body.role, req.body.subjectTeam, meta);
        const data = await store.teamRolesForTeams(req.body.team, req.user);
        await store.audit(meta, `added role [${req.body.role}] for team to team`, {
          team: { id: req.body.team },
        });
        res.json(data);
      } catch (err) {
        next(err);
      }
    });

    app.delete('/api/teams/roles/team', bodyParser.json(), async (req, res, next) => {
      try {
        if (!req.body.team) return next(Boom.badRequest('team is required'));
        if (!req.body.role) return next(Boom.badRequest('role is required'));
        if (!req.body.subjectTeam) return next(Boom.badRequest('subjectTeam is required'));

        if (! await store.hasPermissionOnTeam(req.user, req.body.team, 'teams-manage')) return next(Boom.forbidden());
        if (! await store.hasPermissionOnTeam(req.user, req.body.subjectTeam, 'teams-manage')) return next(Boom.forbidden());
        const team = await store.getTeam(req.body.team);
        if (!team) return next();

        const meta = { date: new Date(), account: { id: req.user.id } };
        await store.revokeRoleOnTeamFromTeam(req.body.team, req.body.role, req.body.subjectTeam, meta);
        const data = await store.teamRolesForTeams(req.body.team, req.user);
        await store.audit(meta, `deleted role [${req.body.role}] for team from team`, {
          team: { id: req.body.team },
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

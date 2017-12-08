import createSystem from '../test-system';
import postgres from '../../lib/components/stores/postgres';
import { makeIdentity, makeAccount, makeMeta, } from '../factories';

describe('Account Store', () => {

  const suites = [
    {
      name: 'Memory',
      system: createSystem()
        .remove('server'),
    },
    {
      name: 'Postgres',
      system: createSystem()
        .set('config.overrides', {
          postgres: {
            tenant: {
              user: 'account_test',
              password: 'password',
            },
          },
        })
        .remove('server')
        .remove('store.account')
        .remove('store.deployment')
        .remove('store.account')
        .include(postgres),
    },
  ];

  suites.forEach(suite => {

    describe(`${suite.name} Store`, () => {

      let system = { stop: cb => cb(), };
      let store = { nuke: () => new Promise(cb => cb()), };
      let root;

      beforeAll(cb => {
        system = suite.system.start((err, components) => {
          if (err) return cb(err);
          store = components.store;
          cb();
        });
      });

      beforeEach(async cb => {
        try {
          await store.nuke();
          root = await store.saveAccount(makeAccount(), makeMeta({ account: null, }));
        } catch (err) {
          cb(err);
        }
        cb();
      });

      afterAll(cb => {
        store.nuke().then(() => {
          system.stop(cb);
        }).catch(cb);
      });

      describe('Save Account', () => {

        it('should create an account', async () => {
          const data = makeAccount();
          const meta = makeMeta();
          const account = await saveAccount(data, meta);

          expect(account).toBeDefined();
          expect(account.id).toBeDefined();
          expect(account.createdOn).toBe(meta.date);
          expect(account.createdBy).toBe(meta.account);
        });

        it('should permit duplicate display names', async () => {
          const data1 = makeAccount({ displayName: 'John', });
          await saveAccount(data1);

          const data2 = makeAccount({ displayName: 'John', });
          await saveAccount(data2);
        });

      });

      describe('Get Account', () => {

        it('should retrieve account by id', async () => {
          const data = makeAccount({ displayName: 'Foo Bar', });
          const meta = makeMeta();
          const saved = await saveAccount(data, meta);
          const account = await getAccount(saved.id);

          expect(account).toBeDefined();
          expect(account.id).toBe(saved.id);
          expect(account.displayName).toBe('Foo Bar');
          expect(account.createdOn.toISOString()).toBe(meta.date.toISOString());
          expect(account.createdBy).toBe(meta.account);
        });

        it('should return undefined when account not found', async () => {
          const account = await getAccount('missing');
          expect(account).toBe(undefined);
        });

        it('should return undefined when account deleted', async () => {
          const saved = await saveAccount();
          await deleteAccount(saved.id);

          const account = await getAccount(saved.id);
          expect(account).toBe(undefined);
        });
      });

      describe('Find Account', () => {

        it('should find an account by identity, provider and type', async () => {
          const saved = await saveAccount();
          const data = makeIdentity({ name: 'foo', provider: 'bar', type: 'baz', });
          await saveIdentity(saved.id, data);

          const account = await findAccount({ name: 'foo', provider: 'bar', type: 'baz', });
          expect(account).toBeDefined();
          expect(account.id).toBe(saved.id);
        });

        it('should return undefined when identity name not found', async () => {
          const saved = await saveAccount();
          const data = makeIdentity({ name: 'foo', provider: 'bar', type: 'baz', });
          await saveIdentity(saved.id, data);

          const account = await findAccount({ name: 'missing', provider: 'bar', type: 'baz', });
          expect(account).toBe(undefined);
        });

        it('should return undefined when provider not found', async () => {
          const saved = await saveAccount();
          const data = makeIdentity({ name: 'foo', provider: 'bar', type: 'baz', });
          await saveIdentity(saved.id, data);

          const account = await findAccount({ name: 'foo', provider: 'missing', type: 'baz',});
          expect(account).toBe(undefined);
        });

        it('should return undefined when type not found', async () => {
          const saved = await saveAccount();
          const data = makeIdentity({ name: 'foo', provider: 'bar', type: 'baz', });
          await saveIdentity(saved.id, data);

          const account = await findAccount({ name: 'foo', provider: 'bar', type: 'missing',});
          expect(account).toBe(undefined);
        });

        it('should return undefined when account deleted', async () => {
          const saved = await saveAccount();
          const data = makeIdentity({ name: 'foo', provider: 'bar', type: 'baz', });
          await saveIdentity(saved.id, data);
          await deleteAccount(saved.id);

          const account = await findAccount({ identity: 'foo', provider: 'bar', type: 'baz', });
          expect(account).toBe(undefined);
        });

        it('should return undefined when identity and provider were deleted', async () => {
          const savedAccount = await saveAccount();
          const data = makeIdentity({ name: 'foo', provider: 'bar', type: 'baz', });
          const identity = await saveIdentity(savedAccount.id, data);
          await deleteIdentity(identity.id);

          const account = await findAccount({ identity: 'foo', provider: 'bar', type: 'baz', });
          expect(account).toBe(undefined);
        });

      });

      describe('Ensure Account', () => {

        it('should return existing account if it already exists', async () => {
          const accountData = makeAccount();
          const identityData = makeIdentity();
          const saved = await saveAccount(accountData);
          await saveIdentity(saved.id, identityData);

          const account = await ensureAccount(accountData, identityData);
          expect(account.id).toBe(saved.id);
        });

        it('should create a new account if the identity doesnt previously exist', async () => {
          const accountData = makeAccount();
          const identityData = makeIdentity();
          const saved = await saveAccount(accountData);

          const account = await ensureAccount(accountData, identityData);
          expect(account.id).toBeDefined();
          expect(account.id).not.toBe(saved.id);
        });

        it('should assign admin role when there are no other active admins', async () => {
          const account1Data = makeAccount();
          const identity1Data = makeIdentity();
          const saved = await saveAccount(account1Data);
          await saveIdentity(saved.id, identity1Data);

          const account2Data = makeAccount();
          const identity2Data = makeIdentity();
          const account = await ensureAccount(account2Data, identity2Data);
          expect(account.id).toBeDefined();
          expect(Object.keys(account.roles)).toEqual(['admin',]);
        });

        it('should assign no roles to a new account when there are already active admins', async () => {
          const account1Data = makeAccount();
          const identity1Data = makeIdentity();
          const saved = await saveAccount(account1Data);
          await saveIdentity(saved.id, identity1Data);
          await grantRole(saved.id, 'admin');

          const account2Data = makeAccount();
          const identity2Data = makeIdentity();
          const account = await ensureAccount(account2Data, identity2Data);
          expect(account.id).toBeDefined();
          expect(Object.keys(account.roles)).toEqual([]);
        });

      });

      describe('List Accounts', () => {

        it('should list accounts, ordered by display name asc', async () => {

          const accounts = [
            {
              data: makeAccount({ displayName: 'c', }),
            },
            {
              data: makeAccount({ displayName: 'a', }),
            },
            {
              data: makeAccount({ displayName: 'b', }),
            },
          ];

          await Promise.all(accounts.map(async account => {
            await saveAccount(account.data);
          }));

          const results = (await listAccounts()).map(a => a.displayName).filter(n => n !== root.displayName);
          const ordered = ['a', 'b', 'c',];
          expect(results).toEqual(ordered);

        });

        describe('Pagination', () => {

          beforeEach(async () => {
            const accounts = [];
            for (var i = 0; i < 51; i++) {
              accounts.push({
                data: makeAccount(),
              });
            }

            await Promise.all(accounts.map(async account => {
              await saveAccount(account.data);
            }));
          });

          it('should limit accounts to 50 by default', async () => {
            const results = await listAccounts();
            expect(results.length).toBe(50);
          });

          it('should limit accounts to the specified number', async () => {
            const results = await listAccounts(10, 0);
            expect(results.length).toBe(10);
          });

          it('should page results', async () => {
            const results = await listAccounts(50, 10);
            // +1 for the account used to create all the other accounts
            expect(results.length).toBe(41 + 1);
          });
        });
      });

      describe('Save Identity', () => {

        it('should create an identity', async () => {
          const account = await saveAccount();
          const identity = await saveIdentity(account.id);
          expect(identity).toBeDefined();
        });

        it('should prevent duplicate active identities for an account', async () => {
          const account = await saveAccount();
          const data = makeIdentity();

          await saveIdentity(account.id, data);
          await expect(
            saveIdentity(account.id, data)
          ).rejects.toHaveProperty('code', '23505');
        });

        it('should prevent duplicate active identities for different accounts', async () => {
          const account1 = await saveAccount();
          const account2 = await saveAccount();
          const data1 = makeIdentity({ name: 'duplicate-name', provider: 'duplicate-provider', type: 'duplicate-type', });
          const data2 = makeIdentity({ name: 'duplicate-name', provider: 'duplicate-provider', type: 'duplicate-type', });

          await saveIdentity(account1.id, data1);
          await expect(
            saveIdentity(account2.id, data2)
          ).rejects.toHaveProperty('code', '23505');
        });

        it('should permit duplicate identity names for different providers', async () => {
          const account = await saveAccount();
          const data1 = makeIdentity({ name: 'duplidate-name', });
          const data2 = makeIdentity({ name: 'duplidate-name', });

          await saveIdentity(account.id, data1);
          await saveIdentity(account.id, data2);
        });

        it('should permit duplicate providers for an account', async () => {
          const account = await saveAccount();
          const data1 = makeIdentity({ provider: 'duplicate-provider', });
          const data2 = makeIdentity({ provider: 'duplicate-provider', });

          await saveIdentity(account.id, data1);
          await saveIdentity(account.id, data2);
        });

        it('should permit duplicate deleted identities', async () => {
          const account = await saveAccount();
          const data = makeIdentity();

          const saved = await saveIdentity(account.id, data);
          await deleteIdentity(saved.id);
          await saveIdentity(account.id, data);
        });

        it('should report an error if account does not exist', async () => {
          const data = makeIdentity();

          await expect(
            saveIdentity('missing', data)
          ).rejects.toHaveProperty('code', '23502');
        });

        it('should report an error if account was deleted', async () => {
          const account = await saveAccount();
          await deleteAccount(account.id);
          const data = makeIdentity();

          await expect(
            saveIdentity(account.id, data)
          ).rejects.toHaveProperty('code', '23502');
        });

      });

      describe('Grant Role', () => {

        it('should grant role to account', async () => {
          const saved = await saveAccount();

          const role = await grantRole(saved.id, 'admin');
          expect(role.id).toBeDefined();

          const account = await getAccount(saved.id);
          expect(account).toBeDefined();
          expect(Object.keys(account.roles)).toEqual(['admin',]);
          expect(account.roles.admin.permissions).toContain('role-grant');
        });

        it('should fail if account does not exist', async () => {
          await expect(
            grantRole('missing', 'admin')
          ).rejects.toHaveProperty('code', '23502');
        });

        it('should fail if role does not exist', async () => {
          const saved = await saveAccount();
          await expect(
            grantRole(saved.id, 'missing')
          ).rejects.toHaveProperty('code', '23502');
        });

        it('should tolerate duplicate roles', async () => {
          const saved = await saveAccount();
          await grantRole(saved.id, 'admin');
          await grantRole(saved.id, 'admin');

          const account = await getAccount(saved.id);
          expect(account).toBeDefined();
          expect(Object.keys(account.roles)).toEqual(['admin',]);
        });
      });


      describe('Revoke Role', () => {

        it('should revoke role from account', async () => {
          const saved = await saveAccount();
          const role = await grantRole(saved.id, 'admin');
          await revokeRole(role.id);

          const account = await getAccount(saved.id);
          expect(account).toBeDefined();
          expect(Object.keys(account.roles)).toEqual([]);
        });

        it('should tolerate missing role', async () => {
          await revokeRole('missing');
        });

        it('should tolerate previously revoked role', async () => {
          const account = await saveAccount();

          const role = await grantRole(account.id, 'admin');
          await revokeRole(role.id);
          await revokeRole(role.id);
        });
      });

      function saveAccount(account = makeAccount(), meta = makeMeta({ account: root.id, })) {
        return store.saveAccount(account, meta);
      }

      function ensureAccount(account = makeAccount(), identity = makeIdentity(), meta = makeMeta({ account: root.id, })) {
        return store.ensureAccount(account, identity, meta);
      }

      function getAccount(id) {
        return store.getAccount(id);
      }

      function findAccount(criteria) {
        return store.findAccount(criteria);
      }

      function listAccounts(limit, offset) {
          return store.listAccounts(limit, offset);
      }

      function deleteAccount(id, meta = makeMeta({ account: root.id, })) {
        return store.deleteAccount(id, meta);
      }

      function saveIdentity(accountId, identity = makeIdentity(), meta = makeMeta({ account: root.id, })) {
        return store.saveIdentity(accountId, identity, meta);
      }

      function deleteIdentity(id, meta = makeMeta({ account: root.id, })) {
        return store.deleteIdentity(id, meta);
      }

      function grantRole(id, name, meta = makeMeta({ account: root.id, })) {
        return store.grantRole(id, name, meta);
      }

      function revokeRole(id, meta = makeMeta({ account: root.id, })) {
        return store.revokeRole(id, meta);
      }

    });
  });
});

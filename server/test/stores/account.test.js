import createSystem from '../test-system';
import postgres from '../../lib/components/stores/postgres';
import { makeAccount, makeMeta, } from '../factories';

describe('Account Store', () => {

  const suites = [
    {
      name: 'Memory',
      system: createSystem()
        .remove('server'),
    },
    // {
    //   name: 'Postgres',
    //   system: createSystem()
    //     .set('config.overrides', {
    //       postgres: {
    //         tenant: {
    //           user: 'account_test',
    //           password: 'password',
    //         },
    //       },
    //     })
    //     .remove('server')
    //     .remove('store.account')
    //     .remove('store.deployment')
    //     .remove('store.account')
    //     .include(postgres),
    // },
  ];

  suites.forEach(suite => {

    describe(`${suite.name} Store`, () => {

      let system = { stop: cb => cb(), };
      let store = { nuke: new Promise(cb => cb()), };

      beforeAll(cb => {
        system = suite.system.start((err, components) => {
          if (err) return cb(err);
          store = components.store;
          cb();
        });
      });

      beforeEach(async cb => {
        store.nuke().then(cb);
      });

      afterAll(cb => {
        store.nuke().then(() => {
          system.stop(cb);
        }).catch(cb);
      });

      describe('Save account', () => {

        it('should create an account', async () => {
          const data = makeAccount();
          const meta = makeMeta();
          const account = await store.saveAccount(data, meta);

          expect(account).toBeDefined();
          expect(account.id).toBeDefined();
          expect(account.createdOn).toBe(meta.date);
          expect(account.createdBy).toBe(meta.user);
        });

        it('should prevent duplicate active accounts', async () => {
          const data = makeAccount({
            identity: 'duplicate-identity',
            provider: 'duplicate-provider',
          });
          await store.saveAccount(data, makeMeta());
          await expect(store.saveAccount(data, makeMeta())).rejects.toHaveProperty('code', '23505');
        });

        it('should permit duplicate account ids with difference provider', async () => {
          const data1 = makeAccount({
            identity: 'duplicate-identity',
            provider: 'provider-1',
          });
          await store.saveAccount(data1, makeMeta());

          const data2 = makeAccount({
            identity: 'duplicate-identity',
            provider: 'provider-2',
          });
          await store.saveAccount(data2, makeMeta());
        });

        it('should permit duplicate deleted accounts', async () => {
          const data1 = makeAccount({
            identity: 'duplicate-identity',
            provider: 'duplicate-provider',
            deletedOn: new Date(),
            deletedBy: 'anonymous',
          });
          await store.saveAccount(data1, makeMeta());

          const data2 = makeAccount({
            identity: 'duplicate-identity',
            provider: 'duplicate-provider',
            deletedOn: new Date(),
            deletedBy: 'anonymous',
          });
          await store.saveAccount(data2, makeMeta());

          const data3 = makeAccount({
            identity: 'duplicate-identity',
            provider: 'duplicate-provider',
          });
          await store.saveAccount(data3, makeMeta());
        });

      });

      describe('Get Account', () => {

        it('should retrieve account by id', async () => {
          const data = makeAccount();
          const meta = makeMeta();
          const saved = await store.saveAccount(data, meta);
          const account = await store.getAccount(saved.id);

          expect(account).toBeDefined();
          expect(account.id).toBe(saved.id);
          expect(account.identity).toBe(saved.identity);
          expect(account.provider).toBe(data.provider);
          expect(account.displayName).toBe(data.displayName);
          expect(account.createdOn.toISOString()).toBe(meta.date.toISOString());
          expect(account.createdBy).toBe(meta.user);
        });

        it('should return undefined when account not found', async () => {
          const account = await store.getAccount('missing');
          expect(account).toBe(undefined);
        });
      });

      describe('Find Account', () => {

        it('should find an account by identity and provider', async () => {
          const data = makeAccount({
            identity: 'foo',
            provider: 'bar',
          });
          const meta = makeMeta();
          const saved = await store.saveAccount(data, meta);
          const account = await store.findAccount({ identity: 'foo', provider: 'bar', });

          expect(account).toBeDefined();
          expect(account.id).toBe(saved.id);
        });

        it('should return undefined when identity not found', async () => {
          const data = makeAccount({
            identity: 'foo',
            provider: 'bar',
          });
          const meta = makeMeta();
          await store.saveAccount(data, meta);

          const account = await store.findAccount({ identity: 'missing', provider: 'bar', });
          expect(account).toBe(undefined);
        });

        it('should return undefined when provider not found', async () => {
          const data = makeAccount({
            identity: 'foo',
            provider: 'bar',
          });
          const meta = makeMeta();
          await store.saveAccount(data, meta);

          const account = await store.findAccount({ identity: 'foo', provider: 'missing', });
          expect(account).toBe(undefined);
        });

      });

      describe('Delete Account', () => {

        it('should soft delete an account', async () => {

          const data = makeAccount();
          const saved = await store.saveAccount(data, makeMeta());

          await store.deleteAccount(saved.id, makeMeta());
          const account = await store.getAccount(data.id);

          expect(account).toBe(undefined);
        });

      });

      describe('List Accounts', () => {

        it('should list accounts, ordered by identity desc and privider desc', async () => {

          const accounts = [
            {
              data: makeAccount({
                identity: 'a',
                provider: 'b',
              }),
              meta: makeMeta({ user: 'second', date: new Date('2015-07-01T10:11:12.000Z'), }),
            },
            {
              data: makeAccount({
                identity: 'c',
                provider: 'b',
              }),
              meta: makeMeta({ user: 'sixth', date: new Date('2012-07-01T10:11:12.000Z'), }),
            },
            {
              data: makeAccount({
                identity: 'a',
                provider: 'a',
              }),
              meta: makeMeta({ user: 'first', date: new Date('2014-07-01T10:11:12.000Z'), }),
            },
            {
              data: makeAccount({
                identity: 'b',
                provider: 'a',
              }),
              meta: makeMeta({ user: 'fourth', date: new Date('2016-07-01T10:11:12.000Z'), }),
            },
            {
              data: makeAccount({
                identity: 'a',
                provider: 'c',
              }),
              meta: makeMeta({ user: 'third', date: new Date('2013-07-01T10:11:12.000Z'), }),
            },
            {
              data: makeAccount({
                identity: 'c',
                provider: 'a',
              }),
              meta: makeMeta({ user: 'fifth', date: new Date('2011-07-01T10:11:12.000Z'), }),
            },
          ];

          await Promise.all(accounts.map(async account => {
            await store.saveAccount(account.data, account.meta);
          }));

          const results = await store.listAccounts();
          const users = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth',];
          expect(results.length).toBe(users.length);
          users.forEach((user, index) => {
            expect(results[index].createdBy).toBe(user);
          });

        });

        describe('Pagination', () => {

          beforeEach(async () => {
            const accounts = [];
            for (var i = 0; i < 51; i++) {
              accounts.push({
                data: makeAccount(),
                meta: makeMeta(),
              });
            }

            await Promise.all(accounts.map(async account => {
              await store.saveAccount(account.data, account.meta);
            }));
          });

          it('should limit accounts to 50 by default', async () => {
            const results = await store.listAccounts();
            expect(results.length).toBe(50);
          });

          it('should limit accounts to the specified number', async () => {
            const results = await store.listAccounts(10, 0);
            expect(results.length).toBe(10);
          });

          it('should page results', async () => {
            const results = await store.listAccounts(50, 10);
            expect(results.length).toBe(41);
          });
        });
      });
    });
  });
});

const request = require('request-promise');
const { resolve } = require('path');

const token = process.argv[2];
if (!token) {
  console.error('Token required'); // eslint-disable-line no-console
  process.exit(1);
}
const rootUrl = 'http://localhost:3000/api';


const headers = {
  'bearer': token,
};

request.get({
  url: `${rootUrl}/clusters`,
  headers,
  json: true,
}).then((response) => {
  if (response.items && response.items.length !== 0 && response.items.find(({ name }) => name === 'local')) {
    return response.items.find(({ name }) => name === 'local');
  }

  return request.post({
    url: `${rootUrl}/clusters`,
    headers,
    json: true,
    body: {
      name: 'local',
      config: resolve(process.env.HOME, '.kube/config'),
      color: 'saddlebrown',
    },
  }).then((postResponse) => {
    return postResponse;
  });
}).then((cluster) => {
  return request.get({
    url: `${rootUrl}/namespaces`,
    headers,
    json: true,
  }).then((response) => {
    return Promise.all([
      Promise.resolve().then(() => {
        if (response.items && response.items.length !== 0 && response.items.find(({ name, cluster: { id } }) => name === 'default' && id === cluster.id)) {
          return response.items.find(({ name, cluster: { id } }) => name === 'default' && id === cluster.id);
        }

        return request.post({
          url: `${rootUrl}/namespaces`,
          headers,
          json: true,
          body: {
            name: 'default',
            cluster: cluster.name,
            context: 'docker-for-desktop'
          },
        }).then((postResponse) => {
          return postResponse;
        });

      }),
      Promise.resolve().then(() => {
        if (response.items && response.items.length !== 0 && response.items.find(({ name, cluster: { id } }) => name === 'another' && id === cluster.id)) {
          return response.items.find(({ name, cluster: { id } }) => name === 'another' && id === cluster.id);
        }

        return request.post({
          url: `${rootUrl}/namespaces`,
          headers,
          json: true,
          body: {
            name: 'another',
            cluster: cluster.name,
            context: 'docker-for-desktop'
          },
        }).then((postResponse) => {
          return postResponse;
        });

      }),
    ]);
  });
})
.then(() => process.exit(0))
.catch((err) => {
  console.error(err); // eslint-disable-line no-console
  process.exit(1);
});

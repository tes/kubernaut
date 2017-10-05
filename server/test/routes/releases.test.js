import request from 'request-promise';
import createSystem from '../test-system';
import human from '../../lib/components/logging/human';
import kubernetes from '../../lib/components/kubernetes/kubernetes-stub';
import fs from 'fs';
import path from 'path';

describe('Releases API', () => {

  let config;
  let system = { stop: cb => cb(), };

  const loggerOptions = {};
  const repo = {};

  beforeAll(cb => {
    system = createSystem()
    .set('config.overrides', { server: { port: 13001, }, })
    .set('repo', repo)
    .set('kubernetes', kubernetes()).dependsOn('repo')
    .set('transports.human', human(loggerOptions))
    .start((err, components) => {
      if (err) return cb(err);
      config = components.config;
      cb();
    });
  });

  afterEach(() => {
    loggerOptions.suppress = false;
  });

  afterAll(cb => {
    system.stop(cb);
  });

  it('should render the kubernetes manifest with the fully qualified image name', async (done) => {

    const json = {
      manifest: fs.readFileSync(path.join(__dirname, 'data', 'kubernetes.yaml'), 'utf-8'),
      image: "quay.io/cressie176/kubernaut-hello-world:123",
    };

    await request({
      url: `http://${config.server.host}:${config.server.port}/api/releases`,
      method: 'POST',
      resolveWithFullResponse: true,
      json,
    });

    expect(repo[json.image]).toBeTruthy();
    expect(repo[json.image].length).toBe(3);
    expect(repo[json.image][2].spec.template.spec.containers[0].image).toBe(json.image);
    done();
  });
});

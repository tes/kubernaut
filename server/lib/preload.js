import fs from 'fs';
import path from 'path';

if (fs.existsSync(path.join(process.cwd(), 'elastic-apm-node.js')) || process.env.ELASTIC_APM_CONFIG_FILE || process.env.ELASTIC_APM_APP_NAME) {
  require('elastic-apm-node/start');
}

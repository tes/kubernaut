module.exports = {
  'testMatch': [
    '**/server/test/**/*.test.js?(x)',
  ],
  'testPathIgnorePatterns': [
    'node_modules',
    'server/build',
    'client',
  ],
  'watchPathIgnorePatterns': [
    'server/test/cms/testdata/content/.*',
    'server/test/cms/testdata/references/.*',
  ],
  'testEnvironment': 'node',
  'setupFiles': [
    './server/test/env.js',
  ],
};

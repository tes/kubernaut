state.init(this)

state.set('dockerfile.postcommands', [
  'npm run install-client',
  'npm run lint',
  'npm run build-client',
  'npm run build-server',
])

CheckoutAndDecrypt() {
  BoscoDependencies()

  GenerateDockerfile()
  BuildDockerfile()

}

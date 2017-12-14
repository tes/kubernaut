# Kubernaut
> Definition of kubernaut - an expert or habitual user of the Kubernetes., a person who uses computer technology to experience containerisation.

## Goal
To build a Kubernetes continuous delivery pipeline through discovery. See Kubernaut in action [here](http://kubernaut.tescloud.com). Want to help? Assign yourself an issue from our [backlog](https://github.com/tes/kubernaut/issues#boards?repos=105863649)

## Prerequisites
* Node.js version 8 or higher
* Docker Compose 1.14.0 or higher
* Docker 17 or higher
* Basic understanding of [Kubernetes Concepts](https://kubernetes.io/docs/concepts/)
* Local installation of [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
* Cluster config file (ask Daniel Malon or Stephen Cresswell)
* Familiarity with the [contributor notes](https://github.com/tes/kubernaut/blob/master/CONTRIBUTING.md)
* Familiarity with [kubectl commands](https://kubernetes.io/docs/user-guide/kubectl-overview/), e.g.

```
kubectl apply -f manifest.yaml
kubectl get pods
kubectl delete pod $POD_NAME
kubectl describe pod $POD_NAME --output yaml
kubectl exec -it $POD_NAME sh
```

## Getting Started
```
npm i
cd client; npm i; cd ..
npm run build
npm run start-server-dependencies
npm test
npm run load-test-data
npm start
```
This should open a browser displaying the kubernetes application. Click on the [releases tab](http://localhost:3000/releases) to view the test data.

### Developing
As you make change source code the application should rebuild automatically. You can also run tests in watch mode while developing.
```
npm run test-server-w
```
or
```
npm run test-client-w
```

### Where's The Code?

#### The Server
Kubernaut uses dependency injection called [systemic](https://www.npmjs.com/package/systemic) to organise code. It's the spiritual successor to [electrician](https://www.npmjs.com/package/electrician). Systemic systems are started by a [runner](https://github.com/tes/kubernaut/blob/master/server/index.js) which handles interupts and uncaught exceptions. Server side components and their dependencies are declared [here](https://github.com/tes/kubernaut/blob/master/server/lib/components).

#### The Client
The client is a React/Redux app. It deliberately doesn't have any bells and whistles to compensate for the Redux the boilerplate. The aim is to keep the entry barrier as low as possible.

## Kubernaut Workflow
<pre>
┌────────────────────┬──────────────────────────────┐
│                    │ Kubernetes Manifest Template │
│                    ├──────────────────────────────┤
│                    │      Dockerfile              │
│    Hello World     ├──────────────────────────────┤
│                    │       index.js               │
│                    ├──────────────────────────────┘
│                    │
└────────────────────┘
           │
           │
           ▼
┌────────────────────┐
│                    │
│                    │
│                    │
│       GitHub       │
│                    │
│                    │
│                    │
└────────────────────┘
           │
           │
           ▼
┌────────────────────┐
│                    │
│                    │
│                    │ docker image
│      Jenkins       │──────────────────────┐
│                    │                      │
│                    │                      │
│                    │                      │
├────────────────────┤                      │
│ Release │  Deploy  │                      │
└────────────────────┘                      │
     │          │                           │
     │          │                           │
     │          │                           │
     │          │                           │
     ▼          ▼                           ▼
┌────────────────────┐           ┌────────────────────┐
│                    │           │                    │
│                    │           │                    │
│                    │           │                    │
│     Kubernaut      │           │  Docker Registry   │
│                    │           │                    │
│                    │           │                    │
│                    │           │                    │
└────────────────────┘           └────────────────────┘
           │                                │
           │                                │
           │                                │
           ▼                                │
┌────────────────────┐                      │
│                    │                      │
│                    │                      │
│                    │  docker image        │
│ Kubernets Cluster  │◀─────────────────────┘
│                    │
│                    │
│                    │
└────────────────────┘
</pre>


## Kubernaut Domain Model

<pre>
                               ┌───────────────────┐
                               │                   │
                               │                   │
                               │      Service      │
                               │                   │
                               │                   │
                               └───────────────────┘
                                         │
                                         │
                                         │
                                         │
                                        ╱│╲
┌───────────────────┐          ┌───────────────────┐        ┌───────────────────┐
│                   │          │                   │        │                   │
│                   │         ╱│                   │       ╱│      Release      │
│     Template      │──────────│      Release      │────────│     Attribute     │
│                   │         ╲│                   │       ╲│                   │
│                   │          │                   │        │                   │
└───────────────────┘          └───────────────────┘        └───────────────────┘
                                         │
                                         │
                                         │
                                         │
                                        ╱│╲
                               ┌───────────────────┐
                               │                   │
                               │                   │
                               │    Deployment     │
                               │                   │
                               │                   │
                               └───────────────────┘
</pre>


### Service
An app / micro service

| Property  | Description |
|-----------|-------------|
| name      | the service name, e.g. service-jobs-api |
| namespace | the kubernetes namespace where the service will be deployed, e.g. jobs, resources |

### Release
A release of an app / micro service

| Property  | Description |
|-----------|-------------|
| version   | The release version. Currently jenkins build number, we're considering using / incorporating git commit |

### Template
A moustache template for the kubernetes manifest file (yaml).

| Property  | Description |
|-----------|-------------|
| source    | The template source. The template is rendered using release attributes (see below) to form the kubernates manfiest |

### Release Attribute
Key value pairs, which may be rendered into the kubernetes template, e.g. service name, image, version, commit,

| Property  | Description |
|-----------|-------------|
| name      | attribute name |
| value     | attribute value |

### Deployment
A release of an app / micro service

| Property  | Description |
|-----------|-------------|
| context   | The kubernetes context which defines the target cluster |


## Kubernaut User Model

<pre>
┌───────────────────┐            ┌───────────────────┐           ┌───────────────────┐
│                   │            │                   │           │                   │
│                   │╲          ╱│                   │╲         ╱│                   │
│      Account      │────────────│       Role        │───────────│    Permission     │
│                   │╱          ╲│                   │╱         ╲│                   │
│                   │            │                   │           │                   │
└───────────────────┘            └───────────────────┘           └───────────────────┘
           │
           │
           │
           │
          ╱│╲
┌───────────────────┐
│                   │
│                   │
│     Identity      │
│                   │
│                   │
└───────────────────┘
</pre>


### Account
A user account

| Property  | Description |
|----------------|-------------|
| display_name   | The name of the user |

### Identity
Account identities (e.g. cressie176/github, machine_user/token)

| Property  | Description |
|----------------|-------------|
| name       | The username or id associated with the identity |
| provider   | The name of the identity provider, e.g. GitHub |
| type       | The type of the identity, e.g. OAuth, Token, Trust |

## Role
| Property      | Description |
|---------------|-------------|
| name          | The role name, e.g. admin, maintainer, etc |
| description   | A description of the role |

## Permission
| Property      | Description |
|---------------|-------------|
| name          | The permission name, e.g. read_release, write_release, etc |
| description   | A description of the permission |


## Kubernaut API

### GET /api/releases
Lists all active releases

### GET /api/releases/:id
Gets a single release

### POST /api/releases
Creates a new release

### DELETE /api/releases/:id
Soft deletes a release

### GET /api/deployments
Lists all active deployments

### GET /api/deployments/:id
Gets a single deployment

### POST /api/deployments
Deploys a release using the specified context

### GET /api/deployments/:id/status
Returns the status of a deployment (blocks until known)

| Status | Meaning |
|--------|---------|
| 200    | Deployment met all the conditions of the deployment strategy |
| 404    | Deployment not found by kubernaut |
| 500    | Mismatch between kubernaut's deployment (context or service name) and kubernetes (or a usual server error) |
| 502    | Deployment failed to meet all the conditions of the deployment strategy within the deadline |

### DELETE /api/deployments/:id
Soft deletes a deployment

### GET /api/accounts/:id
Gets a user account

### GET /api/accounts
Lists all active user accounts

### POST /api/accounts
Creates a new user account

#### Body
```json
{
  "displayName": "John Wayne",
}
```

### DELETE /api/accounts/:id
Soft deletes a user account

### POST /api/identities
Creates an account identity

#### Body
```json
{
  "account": "7008eeaa-0e58-45e9-a7cb-773edf9758c3",
  "name": "cressie176",
  "provider": "github",
  "type": "oauth"
}
```


### DELETE /api/identities/:id
Delets an account identity

### POST /api/roles
Grants a role to a user account

#### Body
```json
{
  "account": "7008eeaa-0e58-45e9-a7cb-773edf9758c3",
  "role": "admin"
}
```

### DELETE /api/roles/:id
Revokes a role from a user account


Bump

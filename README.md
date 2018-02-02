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

### Authentication
Kubernaut has a number of authentication strategies. The long term plan is for humans to authenticate via OAuth (e.g. GitHub), and machine users to authenticate via Bearer Tokens. This is still in development, so for the moment the UI automatically authenticates anyone using a fixed user, and you have to manually insert credentials for machine users into PostreSQL. To generate a bearer token, run the following
```
npm run create-bearer-token $KEY

Identity (store in database):  8ebc1d21-e55b-47a0-b5a5-d06b51bc0b63
Bearer Token (use in HTTP requests): djE6OWQxMTU5Y2Q3MzY0ZjEwNDlkNGVmZjQ5ZjI3OGRjOTE6M2UyYWVkZDUwNjQ1ZDI0N2MyMmVmMWMzNzFkNzVkNWQwM2E3N2I1MTgxMWU2NGU0Y2Q2ZjI3NTJiMGMxMjZlYjQ5M2IyYmUyM2JlZmMyZTY2ZmQ1NDE4ZjIxZTJkNmZi
```
Then
```
INSERT INTO account (id, display_name, created_on, created_by)
VALUES (
  uuid_generate_v4(),
  display_name = 'machine-user-1', -- Make sure this is unique
  now(),
  '00000000-0000-0000-0000-000000000000'
);

INSERT INTO identity (id, account, name, provider, type, created_on, created_by)
VALUES (
  uuid_generate_v4(),
  (SELECT id FROM account WHERE display_name = 'machine-user-1'),
  '8ebc1d21-e55b-47a0-b5a5-d06b51bc0b63',
  'kubernaut',
  'bearer',
  now(),
  '00000000-0000-0000-0000-000000000000'
);
```
Now issue API requests using the bearer token
```
curl -i -H "Authorization: Bearer djE6OWQxMTU5Y2Q3MzY0ZjEwNDlkNGVmZjQ5ZjI3OGRjOTE6M2UyYWVkZDUwNjQ1ZDI0N2MyMmVmMWMzNzFkNzVkNWQwM2E3N2I1MTgxMWU2NGU0Y2Q2ZjI3NTJiMGMxMjZlYjQ5M2IyYmUyM2JlZmMyZTY2ZmQ1NDE4ZjIxZTJkNmZi" localhost:3001/api/deployments
```

## Kubernaut Concepts
The two most important concepts in kubernaut are **releases** and **deployments**. A release is something you build, whereas a deployment is something you ship. A release is comprised of a versioned docker image, some attributes and a Kubernetes manifest file template. A deployment is comprised of a release, generated Kubernetes manifest file and a destination [Kubernetes namespace](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/).

### Release Workflow
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
           │
           ▼
┌────────────────────┐
│                    │
│                    │
│                    │ Docker image
│      Jenkins       │──────────────────────┐
│                    │                      │
│                    │                      │
│                    │                      │
└────────────────────┘                      │
          │ Manifest template               │
          │ Release attributes              │
          │                                 │
          ▼                                 ▼
┌────────────────────┐           ┌────────────────────┐
│                    │           │                    │
│                    │           │                    │
│                    │           │                    │
│     Kubernaut      │           │  Docker Registry   │
│                    │           │                    │
│                    │           │                    │
│                    │           │                    │
└────────────────────┘           └────────────────────┘
</pre>

### Deployment Workflow
<pre>
           │ Release
           │ Namespace
           │
           ▼
┌────────────────────┐           ┌────────────────────┐
│                    │           │                    │
│                    │           │                    │
│                    │           │                    │
│     Kubernaut      │           │  Docker Registry   │
│                    │           │                    │
│                    │           │                    │
│                    │           │                    │
└────────────────────┘           └────────────────────┘
           │ Manifest                       │
           │ Namespace                      │
           │                                │
           ▼                                │
┌────────────────────┐                      │
│                    │                      │
│                    │                      │
│                    │  Docker image        │
│ Kubernets Cluster  │◀─────────────────────┘
│                    │
│                    │
│                    │
└────────────────────┘
</pre>


## Kubernaut Domain Model
<pre>
                               ┌───────────────────┐        ┌───────────────────┐
                               │                   │        │                   │
                               │                   │\       │                   │
                               │      Service      │────────│     Registry      │
                               │                   │/       │                   │
                               │                   │        │                   │
                               └───────────────────┘        └───────────────────┘
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
                               ┌───────────────────┐        ┌───────────────────┐        ┌───────────────────┐
                               │                   │        │                   │        │                   │
                               │                   │\       │                   │\       │                   │
                               │    Deployment     │────────│     Namespace     │────────│     Cluster       │
                               │                   │/       │                   │/       │                   │
                               │                   │        │                   │        │                   │
                               └───────────────────┘        └───────────────────┘        └───────────────────┘
</pre>

### Registry
A logical grouping of services. Useful for supporting services with duplicate names and for applying access controls

| Property  | Description |
|-----------|-------------|
| id        |             |
| name      | The registry name, e.g. payments |


### Service
An app / micro service

| Property  | Description |
|-----------|-------------|
| id        |             |
| name      | The service name, e.g. service-jobs-api |
| registry  | A reference to the service's registry |

### Release
A release of an app / micro service

| Property  | Description |
|-----------|-------------|
| id        |             |
| version   | The release version. Currently jenkins build number, we're considering using / incorporating git commit |
| service   | A reference to the release's service |
| template  | A reference to the release's template |

### Template
A moustache template for the kubernetes manifest file (yaml).

| Property       | Description |
|----------------|-------------|
| id             |             |
| source_yaml    | The template source in YAML format. The template is rendered using release attributes (see below) to form the kubernates manfiest |
| source_json    | The template source in JSON format. |

### Release Attribute
Key value pairs, which may be rendered into the kubernetes template, e.g. service name, image, version, commit,

| Property  | Description |
|-----------|-------------|
| id        |             |
| name      | Attribute name |
| value     | Attribute value |

### Cluster
Represents a Kubernetes cluster

| Property  | Description |
|-----------|-------------|
| id        |             |
| name      | The cluster name |
| context   | The context to be used when interacting with this cluster |


### Namespace
A logical grouping of deployments. Equates to kubernetes namespaces. Useful for applying access controls

| Property  | Description |
|-----------|-------------|
| id        |             |
| name      | The registry name, e.g. payments |
| cluster   | Reference to the namespace's cluster |

### Deployment
A release of an app / micro service

| Property  | Description |
|-----------|-------------|
| id        |             |
| release   | Reference to the deployment's release |
| namespace | Reference to the deployment's namespace |

## Kubernaut Permissions Model

<pre>
┌───────────────────┐
│                   │
│                   │
│     Identity      │
│                   │
│                   │
└───────────────────┘
         ╲│╱
          │
          │
          │
┌───────────────────┐            ┌───────────────────┐           ┌───────────────────┐
│                   │            │                   │           │                   │
│                   │╲          ╱│                   │╲         ╱│                   │
│      Account      │────────────│       Role        │───────────│    Permission     │
│                   │╱    │     ╲│                   │╱         ╲│                   │
│                   │     │      │                   │           │                   │
└───────────────────┘     │      └───────────────────┘           └───────────────────┘
                          │
                          │
                ┌───────────────────┐
                │                   │
                │                   │
                │     Subject       │
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

## Subject
Subject may be a [Registry](#registry) or a [Namespace](#namespace).


## Kubernaut API

### GET /api/registries
Lists all active registries

#### Parameters
| Name   | Type    | Mandatory | Default | Notes   |
|--------|---------|-----------|---------|---------|
| limit  | Query   | No        | 50      | Limits the number of items returned in the response |
| offset | Query   | No        | 0       | Sets the items offset |

#### Sample Request
```
GET /api/registries?limit=50&offset=0
```

#### Sample Response
```json
{
  "limit": 50,
  "offset": 0,
  "count": 1,
  "items": [
    {
      "id": "95e7b0b7-6202-4f45-a2cf-b96709cb07b1",
      "name": "default",
      "createdOn": "2018-01-01T13:14:15.000Z",
      "createdBy":{
        "id": "95c0c295-7c00-408e-9409-b9fe8f2db1be",
        "displayName": "Bob Holness"
      }
    }
  ]
}
```

### GET /api/registries/:id
Gets a single registry

#### Parameters
| Name   | Type    | Mandatory | Default | Notes   |
|--------|---------|-----------|---------|---------|
| id     | URL     | Yes       | N/A     | The registry id |

#### Sample Request
```
GET /api/registries/95e7b0b7-6202-4f45-a2cf-b96709cb07b1
```

#### Sample Response
```json
{
  "id": "95e7b0b7-6202-4f45-a2cf-b96709cb07b1",
  "name": "default",
  "createdOn": "2018-01-01T13:14:15.000Z",
  "createdBy": {
    "id": "95c0c295-7c00-408e-9409-b9fe8f2db1be",
    "displayName": "Bob Holness"
  }
}
```

### POST /api/registries
Creates a new registry

#### Sample Request
```
POST /api/registries
```
```json
{
  "name": "default"
}
```

#### Sample Response
```json
{
  "id": "95e7b0b7-6202-4f45-a2cf-b96709cb07b1",
  "name": "default",
  "createdOn": "2018-01-01T13:14:15.000Z",
  "createdBy": {
    "id": "95c0c295-7c00-408e-9409-b9fe8f2db1be",
    "displayName": "Bob Holness"
  }
}
```

### DELETE /api/registries/:id
Deletes a registry

#### Parameters
| Name   | Type    | Mandatory | Default | Notes   |
|--------|---------|-----------|---------|---------|
| id     | URL     | Yes       | N/A     | The registry id |

#### Sample Request
```
DELETE /api/registries/95e7b0b7-6202-4f45-a2cf-b96709cb07b1
```

#### Expected Status Codes
| Status | Meaning |
|--------|---------|
| 204    | Registry was deleted |


### GET /api/namespaces
Lists all active namespaces

#### Parameters
| Name   | Type    | Mandatory | Default | Notes   |
|--------|---------|-----------|---------|---------|
| limit  | Query   | No        | 50      | Limits the number of items returned in the response |
| offset | Query   | No        | 0       | Sets the items offset |

#### Sample Request
```
GET /api/namespaces?limit=50&offset=0
```

#### Sample Response
```json
{
  "limit": 50,
  "offset": 0,
  "count": 1,
  "items": [
    {
      "id": "95e7b0b7-6202-4f45-a2cf-b96709cb07b1",
      "name": "default",
      "cluster": {
        "id": "a6d41d27-d96e-49fd-ae41-7419a42aa377",
        "name": "development-eu",
        "context": "dev"
      },
      "createdOn": "2018-01-01T13:14:15.000Z",
      "createdBy": {
        "id": "95c0c295-7c00-408e-9409-b9fe8f2db1be",
        "displayName": "Bob Holness"
      }
    }
  ]
}
```

### GET /api/clusters
Lists all active clusters

#### Parameters
| Name   | Type    | Mandatory | Default | Notes   |
|--------|---------|-----------|---------|---------|
| limit  | Query   | No        | 50      | Limits the number of items returned in the response |
| offset | Query   | No        | 0       | Sets the items offset |

#### Sample Request
```
GET /api/clusters?limit=50&offset=0
```

#### Sample Response
```json
{
  "limit": 50,
  "offset": 0,
  "count": 1,
  "items": [
    {
      "id": "a6d41d27-d96e-49fd-ae41-7419a42aa377",
      "name": "development-eu",
      "context": "dev",
      "createdOn": "2018-01-01T13:14:15.000Z",
      "createdBy":{
        "id": "95c0c295-7c00-408e-9409-b9fe8f2db1be",
        "displayName": "Bob Holness"
      }
    }
  ]
}
```

### GET /api/clusters/:id
Gets a single cluster

#### Parameters
| Name   | Type    | Mandatory | Default | Notes   |
|--------|---------|-----------|---------|---------|
| id     | URL     | Yes       | N/A     | The cluster id |

#### Sample Request
```
GET /api/clusters/a6d41d27-d96e-49fd-ae41-7419a42aa377
```

#### Sample Response
```json
{
  "id": "a6d41d27-d96e-49fd-ae41-7419a42aa377",
  "name": "development-eu",
  "context": "dev",
  "createdOn": "2018-01-01T13:14:15.000Z",
  "createdBy": {
    "id": "95c0c295-7c00-408e-9409-b9fe8f2db1be",
    "displayName": "Bob Holness"
  }
}
```

### POST /api/clusters
Creates a new cluster

#### Sample Request
```
POST /api/clusters
```
```json
{
  "name": "development-eu",
  "context": "dev"
}
```

#### Sample Response
```json
{
  "id": "a6d41d27-d96e-49fd-ae41-7419a42aa377",
  "name": "development-eu",
  "context": "dev",
  "createdOn": "2018-01-01T13:14:15.000Z",
  "createdBy": {
    "id": "95c0c295-7c00-408e-9409-b9fe8f2db1be",
    "displayName": "Bob Holness"
  }
}
```

### DELETE /api/clusters/:id
Deletes a cluster

#### Parameters
| Name   | Type    | Mandatory | Default | Notes   |
|--------|---------|-----------|---------|---------|
| id     | URL     | Yes       | N/A     | The cluster id |

#### Sample Request
```
DELETE /api/clusters/a6d41d27-d96e-49fd-ae41-7419a42aa377
```

#### Expected Status Codes
| Status | Meaning |
|--------|---------|
| 204    | Cluster was deleted |


### GET /api/namespaces/:id
Gets a single namespace

#### Parameters
| Name   | Type    | Mandatory | Default | Notes   |
|--------|---------|-----------|---------|---------|
| id     | URL     | Yes       | N/A     | The namespace id |

#### Sample Request
```
GET /api/namespaces/95e7b0b7-6202-4f45-a2cf-b96709cb07b1
```

#### Sample Response
```json
{
  "id": "95e7b0b7-6202-4f45-a2cf-b96709cb07b1",
  "name": "default",
  "cluster": {
    "id": "a6d41d27-d96e-49fd-ae41-7419a42aa377",
    "name": "development-eu",
    "context": "dev"
  },
  "createdBy": {
    "id": "95c0c295-7c00-408e-9409-b9fe8f2db1be",
    "displayName": "Bob Holness"
  }
}
```

### POST /api/namespaces
Creates a new namespace

#### Sample Request
```
POST /api/namespaces
```
```json
{
  "name": "default",
  "cluster": "a6d41d27-d96e-49fd-ae41-7419a42aa377"
}
```

#### Sample Response
```json
{
  "id": "95e7b0b7-6202-4f45-a2cf-b96709cb07b1",
  "name": "default",
  "cluster": {
    "id": "a6d41d27-d96e-49fd-ae41-7419a42aa377",
    "name": "development-eu",
    "context": "dev"
  },
  "createdBy": {
    "id": "95c0c295-7c00-408e-9409-b9fe8f2db1be",
    "displayName": "Bob Holness"
  }
}
```

### DELETE /api/namespaces/:id
Deletes a namespace

#### Parameters
| Name   | Type    | Mandatory | Default | Notes   |
|--------|---------|-----------|---------|---------|
| id     | URL     | Yes       | N/A     | The namespace id |

#### Sample Request
```
DELETE /api/namespaces/95e7b0b7-6202-4f45-a2cf-b96709cb07b1
```

#### Expected Status Codes
| Status | Meaning |
|--------|---------|
| 204    | Namespace was deleted |


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
Deploys a release to the specified namespace. "cluster", "namespace", "registry", "service" and "version" are required attributes. These and any additional attributes you specify will be available to the manifest template.

#### Parameters
| Name   | Type    | Mandatory | Default | Notes   |
|--------|---------|-----------|---------|---------|
| wait   | query   | No        | N/A     | Add wait=true to tell kubernaut to wait for the rollout to complete before responding. You may need to disable or extend client timeouts |

#### Sample Request
```
POST /api/deployments?wait=true
```
```json
{
   "cluster": "development-eu",
   "namespace": "default",
   "registry": "default",
   "service": "kubernaut",
   "version": "f2e2bbf-212",
   "replicas": 3,
   "containerPort: 3001
 }
```

#### Expected Status Codes
| Status | Meaning |
|--------|---------|
| 200    | The deployment was successful (only returned when wait=true) |
| 202    | The deployment has been accecpt. You can GET /api/deployments/:id to check on status |
| 400    | The supplied registry, service, version, cluster or namespace were invalid |
| 500    | The deployment failed. Likely causes a manifest rendering error, or the deployment failed one of its kubernetes probes |

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



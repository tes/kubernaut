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
The client is a React/Redux app. It deliberately doesn't have any bells and whistles to compensate for the Redux the boilerplate, as I want to keep the entry barrier as low as possible.

## Workflow
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


## Kubernaut Domain Model (Work In Progress)

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
                               ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐

                               │                   │
                                    Deployment
                               │                   │

                               └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
</pre>

### Service
An app / micro service

| Property  |   |
|-----------|---|
| name      | the service name, e.g. service-jobs-api |
| namespace | the kubernetes namespace where the service will be deployed, e.g. jobs, resources |

### Release
A release of an app / micro service

| Property  |   |
|-----------|---|
| version   | The release version. Currently jenkins build number, we're considering using / incorporating git commit |

### Template
A moustache template for the kubernetes manifest file (yaml).

| Property  |   |
|-----------|---|
| source    | The template source. The template is rendered using release attributes (see below) to form the kubernates manfiest |

### Release Attribute
Key value pairs, which may be rendered into the kubernetes template, e.g. service name, image, version, commit,

| Property  |   |
|-----------|---|
| name      | attribute name |
| value     | attribute value |

### Deployment
A release of an app / micro service

| Property  |   |
|-----------|---|
| context   | The kubernetes context which defines the target cluster |


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
Deploys the specified release to a context

### DELETE /api/deployments/:id
Soft deletes a deployment




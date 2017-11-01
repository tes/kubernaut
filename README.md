# kubernaut
> Definition of kubernaut - an expert or habitual user of the Kubernetes., a person who uses computer technology to experience containerisation.

See https://github.com/tes/infra/issues/1857 for background

## Goal
Discover a kubernetes deployment pipeline

## Prerequisites
* Basic understanding of [Kubernetes Concepts](https://kubernetes.io/docs/concepts/)
* Local installation of [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
* Cluster config file (ask Daniel Malon or Stephen Cresswell)
* Familiary with [kubectl commands](https://kubernetes.io/docs/user-guide/kubectl-overview/), e.g.

```
kubectl apply -f manifest.yaml
kubectl get pods
kubectl delete pod $POD_NAME
kubectl describe pod $POD_NAME --output yaml
kubectl exec -it $POD_NAME sh
```

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




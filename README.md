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


## API

### GET /api/releases
Lists all active releases

### GET /api/releases/:id
Gets a single release

### POST /api/releases
Creates a new release

### DELETE /api/releases/:id
Soft deletes a release




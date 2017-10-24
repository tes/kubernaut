# kubernaut
> Definition of kubernaut - an expert or habitual user of the Kubernetes., a person who uses computer technology to experience containerisation.

See https://github.com/tes/infra/issues/1857 for background

## Goal
Discover a kubernetes deployment pipeline

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
│                    │
│      Jenkins       │──────────────────────┐
│                    │                      │
│                    │                      │
│                    │                      │
├────────────────────┤                      │
│ Release │   Deploy │                      │
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
│                    │                      │
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





import { createAction, handleActions } from 'redux-actions';
import { safeLoad } from 'js-yaml';
const actionsPrefix = 'KUBERNAUT/BUILDER_TEST';
export const INITIALISE = createAction(`${actionsPrefix}/INITIALISE`);
export const toggleCollapsed = createAction(`${actionsPrefix}/TOGGLE_COLLAPSED`);

const testYaml = `
apiVersion: batch/v1beta1
kind: CronJob
metadata:
  name: batch-search-relevance
  namespace: default
spec:
  schedule: "0 * * * *"
  concurrencyPolicy: Replace
  jobTemplate:
    spec:
      backoffLimit: 10
      template:
        metadata:
          labels:
            com.tescloud/service: "true"
        spec:
          initContainers:
          - name: generate-eff
            image: docker-registry.tescloud.com/default/batch-search-relevance:latest
            command:
            - node
            - batch.js
            - /cache
            volumeMounts:
            - mountPath: /cache
              name: cache
          containers:
          - name: s3-upload
            image: quay.io/coreos/awscli:025a357f05242fdad6a81e8a6b520098aa65a600
            command:
            - aws
            - s3
            - sync
            - /cache/
            - s3://$(BUCKET)/search-relevance/
            volumeMounts:
            - mountPath: /cache
              name: cache
          - name: hello
            image: busybox
            args:
            - /bin/sh
            - -c
            - date; echo Hello from the Kubernetes cluster
          restartPolicy: OnFailure
          volumes:
          - name: cache
            emptyDir: {}
          - name: config
            configMap:
              name: config-test
`;
const parsedYaml = safeLoad(testYaml);

function valuesFromYaml(parsed) {
  const { spec } = parsed;
  return {
    schedule: spec.schedule,
    concurrencyPolicy: spec.concurrencyPolicy || 'Allow',
    initContainers: spec.jobTemplate.spec.template.spec.initContainers,
    containers: spec.jobTemplate.spec.template.spec.containers,
    volumes: spec.jobTemplate.spec.template.spec.volumes.map(v => {
      const toReturn = {
        name: v.name,
      };
      if (v.emptyDir) toReturn.type = 'emptyDir';
      if (v.configMap) {
        toReturn.type = 'configMap';
        toReturn.configMap = v.configMap;
      }

      return toReturn;
    }),
  };
}

const defaultState = {
  initialValues: valuesFromYaml(parsedYaml),
  collapsed: {
    initContainers: true,
    containers: false,
    volumes: true,
  },
};


export default handleActions({
  [INITIALISE]: () => ({ ...defaultState }),
  [toggleCollapsed]: (state, { payload }) => ({
    ...state,
    collapsed: {
      ...state.collapsed,
      [payload]: !state.collapsed[payload] || false, // in case we get undefined, just make it false.
    }
  }),
}, defaultState);

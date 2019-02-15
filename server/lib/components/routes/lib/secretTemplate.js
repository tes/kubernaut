export default `
apiVersion: v1
kind: Secret
metadata:
  name: {{service.name}}
type: Opaque
data:
{{#secrets}}
  {{key}}: {{value}}
{{/secrets}}
---
`;

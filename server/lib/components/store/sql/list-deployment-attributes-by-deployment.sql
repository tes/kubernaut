SELECT
  da.name,
  da.value,
  da.deployment
FROM
  deployment_attribute da
WHERE
  da.deployment = $1
ORDER BY
  name ASC
;

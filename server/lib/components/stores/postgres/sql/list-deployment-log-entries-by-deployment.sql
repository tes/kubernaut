SELECT
  dle.id,
  dle.sequence,
  dle.written_on,
  dle.written_to,
  dle.content
FROM
  deployment_log_entry dle
WHERE
  dle.deployment = $1
ORDER BY
  dle.written_on ASC,
  dle.sequence ASC
;

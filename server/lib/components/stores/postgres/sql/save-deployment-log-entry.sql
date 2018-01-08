INSERT INTO deployment_log_entry (
  id,
  deployment,
  written_on,
  written_to,
  content
) VALUES (
  uuid_generate_v4(),
  $1,
  $2,
  $3,
  $4
) RETURNING id;

START TRANSACTION;

INSERT INTO account_roles (
  id,
  account,
  role,
  subject,
  subject_type,
  created_on,
  created_by
) SELECT
  uuid_generate_v4(),
  account,
  role,
  subject,
  'namespace',
  created_on,
  created_by
FROM
(
  SELECT
    ar.account,
    ar.role,
    ar.subject,
    ar.created_on,
    ar.created_by,
    r.priority,
    max(r.priority) over (partition by ar.account, ar.subject) as max_priority_for_account
  FROM account_role_namespace ar
  JOIN role r ON r.id = ar.role
  WHERE ar.deleted_on IS NULL
    AND subject IS NOT NULL
) a
WHERE priority = max_priority_for_account
ON CONFLICT DO NOTHING;

INSERT INTO account_roles (
  id,
  account,
  role,
  subject,
  subject_type,
  created_on,
  created_by
) SELECT
  uuid_generate_v4(),
  account,
  role,
  subject,
  'registry',
  created_on,
  created_by
FROM
(
  SELECT
    ar.account,
    ar.role,
    ar.subject,
    ar.created_on,
    ar.created_by,
    r.priority,
    max(r.priority) over (partition by ar.account, ar.subject) as max_priority_for_account
  FROM account_role_registry ar
  JOIN role r ON r.id = ar.role
  WHERE ar.deleted_on IS NULL
    AND subject IS NOT NULL
) a
WHERE priority = max_priority_for_account
ON CONFLICT DO NOTHING;


INSERT INTO account_roles (
  id,
  account,
  role,
  subject_type,
  created_on,
  created_by
) SELECT
  uuid_generate_v4(),
  account,
  role,
  'system',
  created_on,
  created_by
FROM
(
  SELECT
    cr.account,
    cr.role,
    cr.created_on,
    cr.created_by,
    r.priority,
    max(r.priority) over (partition by cr.account) as max_priority_for_account
  FROM (
    SELECT
      arr.account,
      arr.role,
      arr.created_on,
      arr.created_by
    FROM
      account_role_registry arr
    WHERE arr.deleted_on IS null
    UNION
    SELECT
      arn.account,
      arn.role,
      arn.created_on,
      arn.created_by
    FROM
      account_role_namespace arn
    WHERE arn.deleted_on IS null
  ) cr
  JOIN role r ON r.id = cr.role
) a
WHERE priority = max_priority_for_account
ON CONFLICT DO NOTHING;

INSERT INTO account_roles (
  id,
  account,
  role,
  subject_type,
  created_on,
  created_by
) SELECT
  uuid_generate_v4(),
  account,
  role,
  'global',
  created_on,
  created_by
FROM
(
  SELECT
    cr.account,
    cr.role,
    cr.created_on,
    cr.created_by,
    r.priority,
    max(r.priority) over (partition by cr.account) as max_priority_for_account
  FROM (
    SELECT
      arr.account,
      arr.role,
      arr.created_on,
      arr.created_by
    FROM
      account_role_registry arr
    WHERE arr.deleted_on IS null
      AND subject IS NULL
    UNION
    SELECT
      arn.account,
      arn.role,
      arn.created_on,
      arn.created_by
    FROM
      account_role_namespace arn
    WHERE arn.deleted_on IS null
      AND subject IS NULL
  ) cr
  JOIN role r ON r.id = cr.role
) a
WHERE priority = max_priority_for_account
ON CONFLICT DO NOTHING;

COMMIT;

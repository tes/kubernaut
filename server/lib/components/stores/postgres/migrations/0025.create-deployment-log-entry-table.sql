START TRANSACTION;

CREATE TABLE deployment_log_entry (
  id UUID PRIMARY KEY,
  deployment UUID NOT NULL REFERENCES deployment,
  sequence SERIAL NOT NULL,
  written_on TIMESTAMP WITH TIME ZONE NOT NULL,
  written_to TEXT NOT NULL,
  content TEXT NOT NULL,
  CONSTRAINT deployment_log_entry__written_to__chk CHECK (written_to IN ('stdin', 'stdout', 'stderr'))
);

CREATE INDEX deployment_log_entry__deployment__written_on__sequence__idx ON deployment_log_entry (
  deployment DESC, written_on ASC, sequence ASC
);

COMMIT;

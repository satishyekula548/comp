-- Required for cuid-based IDs
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION generate_prefixed_cuid(prefix text)
RETURNS text AS $$
BEGIN
  RETURN prefix || '_' || replace(gen_random_uuid()::text, '-', '');
END;
$$ LANGUAGE plpgsql;

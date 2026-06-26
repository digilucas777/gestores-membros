-- gestores-membros schema
-- Run this in Supabase SQL Editor (Project > SQL Editor > New query)

CREATE TABLE IF NOT EXISTS gestores (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email        text UNIQUE NOT NULL,
  nome         text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz,
  login_count  int NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS modulos (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo     text NOT NULL,
  position   int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS aulas (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo           text NOT NULL,
  descricao        text,
  panda_video_url  text NOT NULL,
  modulo_id        uuid REFERENCES modulos(id) ON DELETE SET NULL,
  position         int NOT NULL DEFAULT 0,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS acessos (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gestor_id   uuid REFERENCES gestores(id) ON DELETE CASCADE,
  accessed_at timestamptz NOT NULL DEFAULT now()
);

-- RLS enabled; all access via service_role bypasses RLS
ALTER TABLE gestores ENABLE ROW LEVEL SECURITY;
ALTER TABLE modulos  ENABLE ROW LEVEL SECURITY;
ALTER TABLE aulas    ENABLE ROW LEVEL SECURITY;
ALTER TABLE acessos  ENABLE ROW LEVEL SECURITY;

-- Helper function to atomically increment login_count
CREATE OR REPLACE FUNCTION increment_login_count(p_email text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE gestores
  SET login_count = login_count + 1,
      last_seen_at = now()
  WHERE email = p_email;
$$;

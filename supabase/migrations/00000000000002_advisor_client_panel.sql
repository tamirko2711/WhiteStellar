-- ============================================================
-- WhiteStellar — Advisor Client Panel Schema
-- Run this in the Supabase SQL Editor (after the main schema)
-- ============================================================

-- ─── 1. Birth details columns on profiles ────────────────────

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_birth  DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS time_of_birth  TIME;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS place_of_birth TEXT;

-- ─── 2. Advisor client notes table ───────────────────────────
-- Private per-advisor notes about a specific client.
-- One row per (advisor, client) pair, upserted on save.

CREATE TABLE IF NOT EXISTS advisor_client_notes (
  id          BIGSERIAL PRIMARY KEY,
  advisor_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notes       TEXT NOT NULL DEFAULT '',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (advisor_id, client_id)
);

ALTER TABLE advisor_client_notes ENABLE ROW LEVEL SECURITY;

-- Advisors can read and write only their own notes
CREATE POLICY "Advisors can manage own client notes" ON advisor_client_notes
  FOR ALL USING (auth.uid() = advisor_id);

-- ─── 3. Allow advisors to read client profiles ────────────────
-- The existing "Users can view own profile" policy only lets users
-- read their own row. Advisors need to read the client's profile
-- during sessions to show birth details in the panel.

DO $$ BEGIN
  CREATE POLICY "Advisors can view client profiles" ON profiles
    FOR SELECT USING (
      EXISTS (SELECT 1 FROM advisors WHERE user_id = auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

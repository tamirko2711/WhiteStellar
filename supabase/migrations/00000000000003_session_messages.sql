-- ============================================================
-- session_messages — real-time chat message sync
-- Run this in the Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS session_messages (
  id            BIGSERIAL PRIMARY KEY,
  session_id    INTEGER REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  sender_id     TEXT NOT NULL,
  sender_name   TEXT NOT NULL DEFAULT '',
  sender_avatar TEXT NOT NULL DEFAULT '',
  text          TEXT NOT NULL,
  is_system     BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE session_messages ENABLE ROW LEVEL SECURITY;

-- MVP: allow all authenticated users to read and insert
CREATE POLICY "session_messages readable" ON session_messages
  FOR SELECT USING (true);

CREATE POLICY "session_messages insertable" ON session_messages
  FOR INSERT WITH CHECK (true);

-- Enable Realtime so both sides receive messages instantly
ALTER PUBLICATION supabase_realtime ADD TABLE session_messages;

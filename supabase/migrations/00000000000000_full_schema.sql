-- ============================================================
-- WhiteStellar — Full Database Schema
-- Run this FIRST in the Supabase SQL Editor
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── ENUM TYPES ──────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE user_type_enum AS ENUM ('client', 'advisor', 'superadmin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE account_status_enum AS ENUM ('active', 'inactive', 'pending', 'frozen');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE advisor_status_enum AS ENUM ('online', 'offline', 'busy');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE session_type_enum AS ENUM ('chat', 'audio', 'video');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE session_status_enum AS ENUM ('completed', 'cancelled', 'in_progress');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE transaction_type_enum AS ENUM ('deposit', 'session_charge', 'refund', 'payout');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE withdrawal_method_enum AS ENUM ('paypal', 'payoneer', 'bank');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE notification_type_enum AS ENUM (
    'session_request', 'session_accepted', 'session_rejected',
    'session_cancelled', 'advisor_online', 'new_review', 'payout_processed'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE intent_score_enum AS ENUM ('high', 'medium', 'low');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── PROFILES ────────────────────────────────────────────────
-- Extends Supabase auth.users

CREATE TABLE IF NOT EXISTS profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       TEXT NOT NULL DEFAULT '',
  avatar_url      TEXT,
  user_type       user_type_enum NOT NULL DEFAULT 'client',
  wallet_balance  NUMERIC(10,2) NOT NULL DEFAULT 0,
  phone           TEXT,
  country         TEXT,
  account_status  account_status_enum NOT NULL DEFAULT 'active',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Superadmin can view all profiles" ON profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'superadmin')
  );

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url, user_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE((NEW.raw_user_meta_data->>'user_type')::user_type_enum, 'client')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── CATEGORIES ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS categories (
  id            SERIAL PRIMARY KEY,
  slug          TEXT NOT NULL UNIQUE,
  title         TEXT NOT NULL,
  icon          TEXT NOT NULL DEFAULT 'Star',
  description   TEXT,
  advisor_count INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are publicly readable" ON categories FOR SELECT USING (true);
CREATE POLICY "Superadmin can manage categories" ON categories FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'superadmin'));

-- ─── SPECIALIZATIONS ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS specializations (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE specializations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Specializations are publicly readable" ON specializations FOR SELECT USING (true);

-- ─── SKILLS & METHODS ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS skills_and_methods (
  id         SERIAL PRIMARY KEY,
  title      TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE skills_and_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Skills are publicly readable" ON skills_and_methods FOR SELECT USING (true);

-- ─── LANGUAGES ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS languages (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  code       CHAR(5) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE languages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Languages are publicly readable" ON languages FOR SELECT USING (true);

-- ─── ADVISORS ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS advisors (
  id                      SERIAL PRIMARY KEY,
  user_id                 UUID REFERENCES profiles(id) ON DELETE CASCADE,
  full_name               TEXT NOT NULL,
  short_bio               TEXT,
  long_bio                TEXT,
  avatar                  TEXT,
  background_image        TEXT,
  status                  advisor_status_enum NOT NULL DEFAULT 'offline',
  account_status          account_status_enum NOT NULL DEFAULT 'pending',
  is_top_advisor          BOOLEAN NOT NULL DEFAULT FALSE,
  is_new                  BOOLEAN NOT NULL DEFAULT TRUE,
  chat_price              NUMERIC(6,2),
  audio_price             NUMERIC(6,2),
  video_price             NUMERIC(6,2),
  rating                  NUMERIC(3,1) NOT NULL DEFAULT 0,
  review_count            INTEGER NOT NULL DEFAULT 0,
  total_sessions          INTEGER NOT NULL DEFAULT 0,
  years_active            INTEGER NOT NULL DEFAULT 0,
  response_time           TEXT NOT NULL DEFAULT '~5 min',
  withdrawal_method       withdrawal_method_enum NOT NULL DEFAULT 'paypal',
  paypal_email            TEXT,
  payoneer_email          TEXT,
  bank_name               TEXT,
  bank_account            TEXT,
  bank_routing            TEXT,
  stripe_account_id       TEXT,
  prescreen_enabled       BOOLEAN NOT NULL DEFAULT FALSE,
  prescreen_session_range INTEGER NOT NULL DEFAULT 1 CHECK (prescreen_session_range BETWEEN 1 AND 3),
  joined_at               DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE advisors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active advisors are publicly readable" ON advisors
  FOR SELECT USING (account_status = 'active' OR auth.uid() = user_id);

CREATE POLICY "Advisors can update own record" ON advisors
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Superadmin full access to advisors" ON advisors FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'superadmin'));

-- ─── ADVISOR JUNCTION TABLES ─────────────────────────────────

CREATE TABLE IF NOT EXISTS advisor_categories (
  advisor_id  INTEGER REFERENCES advisors(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (advisor_id, category_id)
);

ALTER TABLE advisor_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Advisor categories are publicly readable" ON advisor_categories FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS advisor_specializations (
  advisor_id        INTEGER REFERENCES advisors(id) ON DELETE CASCADE,
  specialization_id INTEGER REFERENCES specializations(id) ON DELETE CASCADE,
  PRIMARY KEY (advisor_id, specialization_id)
);

ALTER TABLE advisor_specializations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Advisor specializations are publicly readable" ON advisor_specializations FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS advisor_skills (
  advisor_id INTEGER REFERENCES advisors(id) ON DELETE CASCADE,
  skill_id   INTEGER REFERENCES skills_and_methods(id) ON DELETE CASCADE,
  PRIMARY KEY (advisor_id, skill_id)
);

ALTER TABLE advisor_skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Advisor skills are publicly readable" ON advisor_skills FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS advisor_languages (
  advisor_id  INTEGER REFERENCES advisors(id) ON DELETE CASCADE,
  language_id INTEGER REFERENCES languages(id) ON DELETE CASCADE,
  PRIMARY KEY (advisor_id, language_id)
);

ALTER TABLE advisor_languages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Advisor languages are publicly readable" ON advisor_languages FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS advisor_session_types (
  advisor_id   INTEGER REFERENCES advisors(id) ON DELETE CASCADE,
  session_type session_type_enum NOT NULL,
  PRIMARY KEY (advisor_id, session_type)
);

ALTER TABLE advisor_session_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Advisor session types are publicly readable" ON advisor_session_types FOR SELECT USING (true);

-- ─── REVIEWS ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS reviews (
  id           SERIAL PRIMARY KEY,
  advisor_id   INTEGER REFERENCES advisors(id) ON DELETE CASCADE,
  client_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  client_name  TEXT NOT NULL,
  client_avatar TEXT,
  rating       SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment      TEXT,
  session_type session_type_enum,
  is_approved  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved reviews are publicly readable" ON reviews
  FOR SELECT USING (is_approved = true);
CREATE POLICY "Clients can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Superadmin can manage reviews" ON reviews FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'superadmin'));

-- ─── SESSIONS ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sessions (
  id                SERIAL PRIMARY KEY,
  advisor_id        INTEGER REFERENCES advisors(id) ON DELETE SET NULL,
  client_id         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  advisor_name      TEXT NOT NULL,
  client_name       TEXT NOT NULL,
  type              session_type_enum NOT NULL,
  status            session_status_enum NOT NULL DEFAULT 'in_progress',
  duration_minutes  INTEGER NOT NULL DEFAULT 0,
  price_per_minute  NUMERIC(6,2) NOT NULL,
  total_cost        NUMERIC(10,2) NOT NULL DEFAULT 0,
  has_review        BOOLEAN NOT NULL DEFAULT FALSE,
  notes             TEXT,
  started_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at          TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view own sessions" ON sessions
  FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Advisors can view own sessions" ON sessions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM advisors WHERE id = sessions.advisor_id AND user_id = auth.uid())
  );

CREATE POLICY "Superadmin can view all sessions" ON sessions FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'superadmin'));

-- ─── TRANSACTIONS ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS transactions (
  id                       SERIAL PRIMARY KEY,
  client_id                UUID REFERENCES profiles(id) ON DELETE SET NULL,
  session_id               INTEGER REFERENCES sessions(id) ON DELETE SET NULL,
  type                     transaction_type_enum NOT NULL,
  amount                   NUMERIC(10,2) NOT NULL,
  balance_before           NUMERIC(10,2) NOT NULL,
  balance_after            NUMERIC(10,2) NOT NULL,
  description              TEXT,
  stripe_payment_intent_id TEXT,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS transactions_stripe_payment_intent_id_unique
  ON transactions (stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Superadmin can view all transactions" ON transactions FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'superadmin'));

-- ─── NOTIFICATIONS ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS notifications (
  id         SERIAL PRIMARY KEY,
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type       notification_type_enum NOT NULL,
  title      TEXT NOT NULL,
  message    TEXT NOT NULL,
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  metadata   JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- ─── PRESCREEN SESSIONS ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS prescreen_sessions (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id          TEXT,
  advisor_id          INTEGER REFERENCES advisors(id) ON DELETE CASCADE,
  client_id           UUID REFERENCES profiles(id) ON DELETE CASCADE,
  conversation        JSONB NOT NULL DEFAULT '[]',
  intent_score        intent_score_enum,
  score_reasoning     TEXT,
  recommended_opening TEXT,
  handoff_triggered   BOOLEAN NOT NULL DEFAULT FALSE,
  handoff_reason      TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE prescreen_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advisors can view own prescreen sessions" ON prescreen_sessions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM advisors WHERE id = prescreen_sessions.advisor_id AND user_id = auth.uid())
  );

CREATE POLICY "Service role can manage prescreen sessions" ON prescreen_sessions
  FOR ALL USING (true);

-- ─── ADVISOR CLIENT SESSIONS (prescreen tracking) ────────────

CREATE TABLE IF NOT EXISTS advisor_client_sessions (
  advisor_id      INTEGER REFERENCES advisors(id) ON DELETE CASCADE,
  client_id       UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_count   INTEGER NOT NULL DEFAULT 0,
  first_session_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_session_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (advisor_id, client_id)
);

ALTER TABLE advisor_client_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role can manage advisor_client_sessions" ON advisor_client_sessions
  FOR ALL USING (true);

-- ─── MATCHING SESSIONS ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS matching_sessions (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                UUID REFERENCES profiles(id) ON DELETE SET NULL,
  session_token          TEXT UNIQUE DEFAULT gen_random_uuid()::text,
  conversation           JSONB NOT NULL DEFAULT '[]',
  guided_answers         JSONB NOT NULL DEFAULT '{}',
  recommended_advisor_ids INTEGER[],
  match_reasoning        TEXT,
  converted              BOOLEAN NOT NULL DEFAULT FALSE,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE matching_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create a matching session" ON matching_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own matching sessions" ON matching_sessions
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Service role can manage matching sessions" ON matching_sessions
  FOR ALL USING (true);

-- ─── PAYOUTS ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS payouts (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advisor_id          INTEGER REFERENCES advisors(id) ON DELETE SET NULL,
  amount              NUMERIC(10,2) NOT NULL,
  stripe_transfer_id  TEXT,
  status              TEXT NOT NULL DEFAULT 'pending',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Advisors can view own payouts" ON payouts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM advisors WHERE id = payouts.advisor_id AND user_id = auth.uid())
  );

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
-- ============================================================
-- WhiteStellar — Seed Data
-- Run this SECOND in the Supabase SQL Editor (after schema)
-- ============================================================

-- ─── CATEGORIES ──────────────────────────────────────────────

INSERT INTO categories (id, slug, title, icon, description, advisor_count) VALUES
  (1, 'psychic-readings',   'Psychic Readings',    'Eye',        'Gain deep insights beyond the physical world',    142),
  (2, 'love-relationships', 'Love & Relationships', 'Heart',      'Navigate matters of the heart with clarity',       98),
  (3, 'tarot',              'Tarot Readings',       'Layers',     'Unlock hidden truths through the cards',           76),
  (4, 'astrology',          'Astrology',            'Star',       'Discover how the stars shape your path',           63),
  (5, 'spiritual',          'Spiritual Guidance',   'Sparkles',   'Embark on a journey of self-discovery',            54),
  (6, 'dream-interpretation','Dream Interpretation','Moon',       'Decode the messages in your dreams',              38),
  (7, 'career-finance',     'Career & Finance',     'TrendingUp', 'Find clarity in your professional journey',        45),
  (8, 'mediumship',         'Mediumship',           'Zap',        'Connect with loved ones who have passed',          29)
ON CONFLICT (id) DO NOTHING;

SELECT setval('categories_id_seq', 8);

-- ─── SPECIALIZATIONS ─────────────────────────────────────────

INSERT INTO specializations (id, title, category_id) VALUES
  (1,  'Love & Relationships', 2),
  (2,  'Soulmates',            2),
  (3,  'Breakups & Divorce',   2),
  (4,  'Career & Work',        7),
  (5,  'Money & Prosperity',   7),
  (6,  'Life Path & Destiny',  1),
  (7,  'Past Life',            1),
  (8,  'Deceased Loved Ones',  8),
  (9,  'Spirit Guides',        5),
  (10, 'Energy Healing',       5),
  (11, 'Chakra Balancing',     5),
  (12, 'Birth Chart',          4),
  (13, 'Numerology',           4),
  (14, 'Celtic Cross',         3),
  (15, 'Oracle Cards',         3)
ON CONFLICT (id) DO NOTHING;

SELECT setval('specializations_id_seq', 15);

-- ─── SKILLS & METHODS ────────────────────────────────────────

INSERT INTO skills_and_methods (id, title) VALUES
  (1,  'Clairvoyance'),
  (2,  'Clairsentience'),
  (3,  'Clairaudience'),
  (4,  'Empathy'),
  (5,  'Channeling'),
  (6,  'Pendulum'),
  (7,  'Crystal Ball'),
  (8,  'Runes'),
  (9,  'Automatic Writing'),
  (10, 'Remote Viewing')
ON CONFLICT (id) DO NOTHING;

SELECT setval('skills_and_methods_id_seq', 10);

-- ─── LANGUAGES ───────────────────────────────────────────────

INSERT INTO languages (id, name, code) VALUES
  (1, 'English',    'en'),
  (2, 'Spanish',    'es'),
  (3, 'French',     'fr'),
  (4, 'Portuguese', 'pt'),
  (5, 'German',     'de'),
  (6, 'Italian',    'it'),
  (7, 'Hebrew',     'he'),
  (8, 'Arabic',     'ar')
ON CONFLICT (code) DO NOTHING;

SELECT setval('languages_id_seq', 8);

-- ─── ADVISORS ────────────────────────────────────────────────
-- Note: user_id is NULL for demo advisors (no real auth account)

INSERT INTO advisors (
  id, full_name, short_bio, long_bio, avatar, background_image,
  status, account_status, is_top_advisor, is_new,
  chat_price, audio_price, video_price,
  rating, review_count, total_sessions, years_active, response_time,
  withdrawal_method, joined_at
) VALUES
  (
    1, 'Luna Starweaver',
    'Empathic psychic specializing in love, soul connections & life path guidance.',
    'With over 15 years of experience, Luna channels her natural clairvoyant gifts to bring clarity and healing. Her readings are known for their accuracy and compassionate depth. Luna specializes in matters of the heart but offers insight across all life areas.',
    'https://i.pravatar.cc/150?img=47',
    'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=800',
    'online', 'active', TRUE, FALSE,
    3.99, 4.99, 5.99,
    4.9, 1247, 3821, 15, '~2 min',
    'paypal', '2019-03-12'
  ),
  (
    2, 'Marcus Veil',
    'Tarot master & numerologist. Clear, honest guidance for your crossroads moments.',
    'Marcus has been practicing tarot and numerology for 12 years. Known for his direct, no-nonsense approach, he delivers insights without sugarcoating. His clients appreciate his rare combination of logic and intuition.',
    'https://i.pravatar.cc/150?img=68',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
    'online', 'active', TRUE, FALSE,
    2.99, 3.99, NULL,
    4.8, 892, 2103, 12, '~5 min',
    'payoneer', '2020-07-22'
  ),
  (
    3, 'Celestine Ora',
    'Spiritual healer & medium. Bridging the gap between worlds with love and light.',
    'Celestine discovered her mediumship abilities at age 7. Today she uses her gifts to help clients connect with departed loved ones and navigate grief with grace. Her gentle energy creates a safe space for healing.',
    'https://i.pravatar.cc/150?img=44',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    'busy', 'active', FALSE, FALSE,
    NULL, 5.99, 7.99,
    4.7, 634, 1456, 20, '~8 min',
    'bank', '2018-11-05'
  ),
  (
    4, 'Raven Nightshade',
    'Astrologer & birth chart specialist. Your stars have a story — let''s read it.',
    'Raven has studied Western and Vedic astrology for 8 years, combining both traditions to create rich, nuanced readings. She specializes in natal charts, relationship compatibility, and predictive astrology.',
    'https://i.pravatar.cc/150?img=32',
    'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800',
    'online', 'pending', FALSE, TRUE,
    1.99, NULL, 3.99,
    4.6, 187, 412, 3, '~3 min',
    'paypal', '2023-01-15'
  ),
  (
    5, 'Solomon Grey',
    'Clairvoyant & energy healer with a no-nonsense, practical approach.',
    'Solomon combines his natural clairvoyant gifts with energy healing to help clients clear blockages and move forward. His readings are practical, grounded, and action-oriented.',
    'https://i.pravatar.cc/150?img=57',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
    'offline', 'active', FALSE, FALSE,
    2.49, 3.49, NULL,
    4.5, 423, 987, 7, '~10 min',
    'payoneer', '2021-05-30'
  ),
  (
    6, 'Iris Moonwell',
    'Dream interpreter & past life reader. Unlock the deeper meaning behind your experiences.',
    'Iris has devoted her practice to the exploration of the subconscious. Through dream analysis and past life regression, she helps clients understand recurring patterns and find liberation from them.',
    'https://i.pravatar.cc/150?img=29',
    'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=800',
    'online', 'active', TRUE, FALSE,
    3.49, 4.49, 5.49,
    4.8, 756, 1876, 11, '~4 min',
    'paypal', '2019-09-20'
  )
ON CONFLICT (id) DO NOTHING;

SELECT setval('advisors_id_seq', 6);

-- ─── ADVISOR CATEGORIES ──────────────────────────────────────

INSERT INTO advisor_categories (advisor_id, category_id) VALUES
  (1, 1), (1, 2),
  (2, 3), (2, 4),
  (3, 5), (3, 8),
  (4, 4),
  (5, 1), (5, 5),
  (6, 6), (6, 1)
ON CONFLICT DO NOTHING;

-- ─── ADVISOR SPECIALIZATIONS ─────────────────────────────────

INSERT INTO advisor_specializations (advisor_id, specialization_id) VALUES
  (1, 1), (1, 2), (1, 6),
  (2, 14), (2, 13), (2, 4),
  (3, 8), (3, 9), (3, 10),
  (4, 12), (4, 13),
  (5, 6), (5, 10), (5, 11),
  (6, 7), (6, 6)
ON CONFLICT DO NOTHING;

-- ─── ADVISOR SKILLS ──────────────────────────────────────────

INSERT INTO advisor_skills (advisor_id, skill_id) VALUES
  (1, 1), (1, 4),
  (2, 8), (2, 9),
  (3, 5), (3, 2),
  (4, 1),
  (5, 1), (5, 10),
  (6, 9), (6, 4)
ON CONFLICT DO NOTHING;

-- ─── ADVISOR LANGUAGES ───────────────────────────────────────

INSERT INTO advisor_languages (advisor_id, language_id) VALUES
  (1, 1), (1, 3),
  (2, 1), (2, 5),
  (3, 1), (3, 2),
  (4, 1),
  (5, 1), (5, 4),
  (6, 1), (6, 6)
ON CONFLICT DO NOTHING;

-- ─── ADVISOR SESSION TYPES ───────────────────────────────────

INSERT INTO advisor_session_types (advisor_id, session_type) VALUES
  (1, 'chat'), (1, 'audio'), (1, 'video'),
  (2, 'chat'), (2, 'audio'),
  (3, 'audio'), (3, 'video'),
  (4, 'chat'), (4, 'video'),
  (5, 'chat'), (5, 'audio'),
  (6, 'chat'), (6, 'audio'), (6, 'video')
ON CONFLICT DO NOTHING;

-- ─── REVIEWS ─────────────────────────────────────────────────

INSERT INTO reviews (id, advisor_id, client_name, client_avatar, rating, comment, session_type, is_approved, created_at) VALUES
  (1, 1, 'Sarah M.',   'https://i.pravatar.cc/40?img=5',  5, 'Luna is absolutely incredible. She picked up on details no one could have known. Life-changing reading.',              'video', TRUE, '2024-11-15'),
  (2, 1, 'James T.',   'https://i.pravatar.cc/40?img=12', 5, 'Every session with Luna leaves me feeling grounded and clear. She''s my go-to advisor.',                             'audio', TRUE, '2024-10-28'),
  (3, 2, 'Elena K.',   'https://i.pravatar.cc/40?img=9',  5, 'Marcus is the most accurate tarot reader I''ve ever consulted. He told me things that happened exactly as he described.', 'chat', TRUE, '2024-11-02'),
  (4, 3, 'Michael R.', 'https://i.pravatar.cc/40?img=15', 5, 'Celestine connected with my mother who passed last year. The details she shared were undeniable. I''m forever grateful.',  'video', TRUE, '2024-09-18')
ON CONFLICT (id) DO NOTHING;

SELECT setval('reviews_id_seq', 4);

-- ─── SESSIONS (demo) ─────────────────────────────────────────

INSERT INTO sessions (id, advisor_id, advisor_name, client_name, type, status, duration_minutes, price_per_minute, total_cost, has_review, started_at, ended_at, notes) VALUES
  (1001, 1, 'Luna Starweaver',  'Sarah Mitchell', 'video', 'completed', 22,  5.99, 131.78, TRUE,  '2024-11-15T14:30:00Z', '2024-11-15T14:52:00Z', 'Client seeking clarity on relationship situation.'),
  (1002, 2, 'Marcus Veil',      'Elena Kovacs',   'chat',  'completed', 18,  2.99, 53.82,  TRUE,  '2024-11-02T10:00:00Z', '2024-11-02T10:18:00Z', NULL),
  (1003, 1, 'Luna Starweaver',  'James Torres',   'audio', 'completed', 35,  4.99, 174.65, TRUE,  '2024-10-28T18:00:00Z', '2024-10-28T18:35:00Z', NULL),
  (1004, 3, 'Celestine Ora',    'Sarah Mitchell', 'video', 'cancelled', 0,   7.99, 0,      FALSE, '2024-10-20T09:00:00Z', '2024-10-20T09:00:00Z', NULL)
ON CONFLICT (id) DO NOTHING;

SELECT setval('sessions_id_seq', 1004);

-- ─── ADMIN PROFILE ───────────────────────────────────────────
-- Sets up the superadmin account (auth user already created)

INSERT INTO profiles (id, full_name, user_type, wallet_balance, account_status)
VALUES (
  '47448229-cac6-4bc5-a108-f1c4643b15c8',
  'Tamir Koren',
  'superadmin',
  0,
  'active'
)
ON CONFLICT (id) DO UPDATE SET user_type = 'superadmin';

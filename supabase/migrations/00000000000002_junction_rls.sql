-- ============================================================
-- WhiteStellar — Fix: Junction table RLS policies
-- Run this in the Supabase SQL Editor
-- This allows advisors to save their categories, specializations,
-- skills, and languages from the advisor Profile page.
-- ============================================================

-- ── advisor_categories ──────────────────────────────────────
DROP POLICY IF EXISTS "Advisors can insert their categories" ON advisor_categories;
CREATE POLICY "Advisors can insert their categories" ON advisor_categories
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM advisors WHERE id = advisor_categories.advisor_id AND user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Advisors can delete their categories" ON advisor_categories;
CREATE POLICY "Advisors can delete their categories" ON advisor_categories
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM advisors WHERE id = advisor_categories.advisor_id AND user_id = auth.uid())
  );

-- ── advisor_specializations ──────────────────────────────────
DROP POLICY IF EXISTS "Advisors can insert their specializations" ON advisor_specializations;
CREATE POLICY "Advisors can insert their specializations" ON advisor_specializations
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM advisors WHERE id = advisor_specializations.advisor_id AND user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Advisors can delete their specializations" ON advisor_specializations;
CREATE POLICY "Advisors can delete their specializations" ON advisor_specializations
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM advisors WHERE id = advisor_specializations.advisor_id AND user_id = auth.uid())
  );

-- ── advisor_skills ───────────────────────────────────────────
DROP POLICY IF EXISTS "Advisors can insert their skills" ON advisor_skills;
CREATE POLICY "Advisors can insert their skills" ON advisor_skills
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM advisors WHERE id = advisor_skills.advisor_id AND user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Advisors can delete their skills" ON advisor_skills;
CREATE POLICY "Advisors can delete their skills" ON advisor_skills
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM advisors WHERE id = advisor_skills.advisor_id AND user_id = auth.uid())
  );

-- ── advisor_languages ────────────────────────────────────────
DROP POLICY IF EXISTS "Advisors can insert their languages" ON advisor_languages;
CREATE POLICY "Advisors can insert their languages" ON advisor_languages
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM advisors WHERE id = advisor_languages.advisor_id AND user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Advisors can delete their languages" ON advisor_languages;
CREATE POLICY "Advisors can delete their languages" ON advisor_languages
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM advisors WHERE id = advisor_languages.advisor_id AND user_id = auth.uid())
  );

-- ── saved_advisors ───────────────────────────────────────────
-- Ensure clients can manage their saved advisors
DROP POLICY IF EXISTS "Clients can insert saved advisors" ON saved_advisors;
CREATE POLICY "Clients can insert saved advisors" ON saved_advisors
  FOR INSERT WITH CHECK (auth.uid() = client_id);

DROP POLICY IF EXISTS "Clients can delete saved advisors" ON saved_advisors;
CREATE POLICY "Clients can delete saved advisors" ON saved_advisors
  FOR DELETE USING (auth.uid() = client_id);

DROP POLICY IF EXISTS "Clients can read own saved advisors" ON saved_advisors;
CREATE POLICY "Clients can read own saved advisors" ON saved_advisors
  FOR SELECT USING (auth.uid() = client_id);

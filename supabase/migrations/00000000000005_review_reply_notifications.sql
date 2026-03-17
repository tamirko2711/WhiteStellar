-- ============================================================
-- WhiteStellar — Review Reply → Client Notification System
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. Add advisor_response column to reviews
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS advisor_response TEXT;

-- 2. Add new notification type to enum
ALTER TYPE notification_type_enum ADD VALUE IF NOT EXISTS 'advisor_review_response';

-- 3. RLS: advisors can UPDATE their own reviews (to set advisor_response)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'reviews'
      AND policyname = 'Advisors can update own review response'
  ) THEN
    CREATE POLICY "Advisors can update own review response" ON reviews
      FOR UPDATE USING (
        EXISTS (SELECT 1 FROM advisors WHERE id = reviews.advisor_id AND user_id = auth.uid())
      );
  END IF;
END $$;

-- 4. SECURITY DEFINER trigger: auto-insert client notification when advisor_response is set/updated
CREATE OR REPLACE FUNCTION notify_client_on_advisor_response()
RETURNS TRIGGER AS $$
BEGIN
  -- Fire when advisor_response is set or updated to a non-null value
  IF NEW.advisor_response IS NOT NULL AND
     (OLD.advisor_response IS NULL OR OLD.advisor_response IS DISTINCT FROM NEW.advisor_response) THEN
    INSERT INTO notifications (user_id, type, title, message, metadata)
    VALUES (
      NEW.client_id,
      'advisor_review_response',
      'Your advisor replied to your review',
      NEW.advisor_response,
      jsonb_build_object('review_id', NEW.id, 'advisor_id', NEW.advisor_id)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_client_on_advisor_response ON reviews;
CREATE TRIGGER trg_notify_client_on_advisor_response
  AFTER UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION notify_client_on_advisor_response();

-- 5. SECURITY DEFINER RPC for admin to read all reviews (bypasses is_approved RLS)
CREATE OR REPLACE FUNCTION get_all_reviews_admin()
RETURNS SETOF reviews
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT * FROM reviews ORDER BY created_at DESC;
$$;

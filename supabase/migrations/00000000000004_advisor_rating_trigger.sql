-- ============================================================
-- Auto-sync advisor rating + review_count after any review change
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Function runs as SECURITY DEFINER so it bypasses RLS
-- (the client writing a review cannot directly UPDATE the advisors row
--  because the advisor-update policy requires auth.uid() = user_id)
CREATE OR REPLACE FUNCTION sync_advisor_rating()
RETURNS TRIGGER AS $$
DECLARE
  v_advisor_id INTEGER;
BEGIN
  v_advisor_id := COALESCE(NEW.advisor_id, OLD.advisor_id);

  UPDATE advisors
  SET
    rating = COALESCE((
      SELECT ROUND(AVG(rating)::NUMERIC, 1)
      FROM reviews
      WHERE advisor_id = v_advisor_id
        AND is_approved = true
    ), 0),
    review_count = (
      SELECT COUNT(*)
      FROM reviews
      WHERE advisor_id = v_advisor_id
        AND is_approved = true
    )
  WHERE id = v_advisor_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate to stay idempotent
DROP TRIGGER IF EXISTS trg_sync_advisor_rating ON reviews;

CREATE TRIGGER trg_sync_advisor_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION sync_advisor_rating();

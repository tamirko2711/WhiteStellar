-- ============================================================
-- WhiteStellar — Update review reply notification to include advisor name
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Replace trigger function to look up advisor full_name
CREATE OR REPLACE FUNCTION notify_client_on_advisor_response()
RETURNS TRIGGER AS $$
DECLARE
  v_advisor_name TEXT;
BEGIN
  -- Fire when advisor_response is set or updated to a non-null value
  IF NEW.advisor_response IS NOT NULL AND
     (OLD.advisor_response IS NULL OR OLD.advisor_response IS DISTINCT FROM NEW.advisor_response) THEN

    -- Look up advisor's display name
    SELECT full_name INTO v_advisor_name
    FROM advisors WHERE id = NEW.advisor_id;

    INSERT INTO notifications (user_id, type, title, message, metadata)
    VALUES (
      NEW.client_id,
      'advisor_review_response',
      COALESCE(v_advisor_name, 'Your advisor') || ' replied to your review',
      NEW.advisor_response,
      jsonb_build_object(
        'review_id', NEW.id,
        'advisor_id', NEW.advisor_id,
        'advisor_name', COALESCE(v_advisor_name, '')
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

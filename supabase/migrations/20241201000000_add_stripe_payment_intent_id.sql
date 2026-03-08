-- ============================================================
-- Migration: add stripe_payment_intent_id to transactions
-- Enables idempotent webhook processing — prevents duplicate
-- wallet credits if a webhook is delivered more than once.
-- ============================================================

ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;

-- Unique index ensures no duplicate credits for the same PaymentIntent
CREATE UNIQUE INDEX IF NOT EXISTS transactions_stripe_payment_intent_id_unique
  ON transactions (stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

// ============================================================
// WhiteStellar — Payments API (Stripe via Supabase Edge Functions)
// src/lib/api/payments.ts
// ============================================================

import { supabase } from '../supabase'

/**
 * Creates a Stripe PaymentIntent for a wallet top-up.
 * Returns the clientSecret needed to mount Stripe Elements.
 */
export async function createPaymentIntent(
  amount: number,
  clientId: string,
): Promise<{ clientSecret: string }> {
  const { data, error } = await supabase.functions.invoke('create-payment-intent', {
    body: {
      amount: Math.round(amount * 100), // convert to cents
      clientId,
    },
  })
  if (error) throw new Error(error.message ?? 'Failed to create payment intent')
  return data as { clientSecret: string }
}

/**
 * Requests a payout for an advisor via Stripe Connect transfer.
 */
export async function requestPayout(
  advisorId: string,
  amount: number,
): Promise<{ id: string }> {
  const { data, error } = await supabase.functions.invoke('process-payout', {
    body: {
      advisorId,
      amount: Math.round(amount * 100), // convert to cents
    },
  })
  if (error) throw new Error(error.message ?? 'Failed to process payout')
  return data as { id: string }
}

// ============================================================
// Supabase Edge Function — stripe-webhook
// Handles Stripe webhook events and credits the client wallet
// after a successful payment.
// ============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  // @ts-ignore — Deno-compatible fetch client
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return new Response('Missing stripe-signature header', { status: 400 })
  }

  const body = await req.text()

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!,
    )
  } catch (err) {
    return new Response(`Webhook signature verification failed: ${(err as Error).message}`, {
      status: 400,
    })
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as Stripe.PaymentIntent
    const { clientId } = pi.metadata
    const amountDollars = pi.amount / 100

    if (!clientId) {
      console.error('payment_intent.succeeded: missing clientId in metadata', pi.id)
      return new Response(JSON.stringify({ received: true }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Idempotency check — skip if already processed
    const { data: existing } = await supabase
      .from('transactions')
      .select('id')
      .eq('stripe_payment_intent_id', pi.id)
      .maybeSingle()

    if (!existing) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', clientId)
        .single()

      const balanceBefore = profile?.wallet_balance ?? 0
      const balanceAfter = balanceBefore + amountDollars

      await supabase
        .from('profiles')
        .update({ wallet_balance: balanceAfter })
        .eq('id', clientId)

      await supabase.from('transactions').insert({
        client_id: clientId,
        type: 'deposit',
        amount: amountDollars,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        description: 'Wallet top-up via Stripe',
        stripe_payment_intent_id: pi.id,
      })
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const pi = event.data.object as Stripe.PaymentIntent
    console.error('PaymentIntent failed:', pi.id, pi.last_payment_error?.message)
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})

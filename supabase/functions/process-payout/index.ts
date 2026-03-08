// ============================================================
// Supabase Edge Function — process-payout
// Transfers earnings to an advisor via Stripe Connect.
// ============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { advisorId, amount } = await req.json()

    if (!advisorId || !amount) {
      return new Response(
        JSON.stringify({ error: 'advisorId and amount are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // Get advisor's Stripe Connect account ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_account_id')
      .eq('id', advisorId)
      .single()

    if (profileError || !profile?.stripe_account_id) {
      return new Response(
        JSON.stringify({ error: 'Advisor has no connected Stripe account' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const transfer = await stripe.transfers.create({
      amount,          // in cents
      currency: 'usd',
      destination: profile.stripe_account_id,
    })

    // Record the payout
    await supabase.from('payouts').insert({
      advisor_id: advisorId,
      amount: amount / 100,
      stripe_transfer_id: transfer.id,
      status: 'pending',
    })

    return new Response(
      JSON.stringify({ id: transfer.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})

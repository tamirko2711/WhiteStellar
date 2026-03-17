// ============================================================
// Supabase Edge Function — agora-token
// Generates an Agora RTC token for a given channel + uid.
// Requires AGORA_APP_ID and AGORA_APP_CERTIFICATE secrets.
// ============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { RtcTokenBuilder, RtcRole } from 'npm:agora-access-token'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const APP_ID          = Deno.env.get('AGORA_APP_ID')          ?? ''
const APP_CERTIFICATE = Deno.env.get('AGORA_APP_CERTIFICATE') ?? ''

// Token validity: 1 hour (Agora rejects calls after expiry)
const TOKEN_TTL_SECONDS = 3600

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!APP_ID || !APP_CERTIFICATE) {
      return new Response(
        JSON.stringify({ error: 'AGORA_APP_ID or AGORA_APP_CERTIFICATE secret not set' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { channel, uid } = await req.json()

    if (!channel || uid === undefined || uid === null) {
      return new Response(
        JSON.stringify({ error: '`channel` and `uid` are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const privilegeExpiredTs = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS

    const token = RtcTokenBuilder.buildTokenWithUid(
      APP_ID,
      APP_CERTIFICATE,
      channel,
      uid,
      RtcRole.PUBLISHER,
      privilegeExpiredTs,
    )

    return new Response(
      JSON.stringify({ token, expiresAt: privilegeExpiredTs }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

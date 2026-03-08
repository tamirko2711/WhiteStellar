// ============================================================
// Supabase Edge Function — matching-agent
// AI matching assistant that helps clients find the right advisor.
// ============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? ''

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, matchingSessionId, userMessage, guidedAnswers, conversationHistory } = await req.json()

    if (action === 'chat') {
      // Fetch active advisors for context
      const { data: advisors } = await supabase
        .from('advisors')
        .select(`
          id, full_name, short_bio, rating, chat_price,
          status, is_top_advisor,
          advisor_specializations(specializations(title)),
          advisor_categories(categories(title, slug))
        `)
        .eq('account_status', 'active')
        .order('rating', { ascending: false })
        .limit(20)

      const advisorContext = advisors?.map((a: any) => ({
        id: a.id,
        name: a.full_name,
        bio: a.short_bio,
        rating: a.rating,
        price: a.chat_price,
        status: a.status,
        specializations: a.advisor_specializations?.map((s: any) => s.specializations?.title),
        categories: a.advisor_categories?.map((c: any) => c.categories?.title),
      }))

      const systemPrompt = `You are StarGuide, a warm and intuitive AI matching assistant on WhiteStellar — a premium psychic platform.

Your role is to help visitors find the perfect psychic advisor through empathetic conversation.

The user has already answered two guided questions:
- Their gender: ${guidedAnswers?.gender ?? 'not specified'}
- Their topic of interest: ${guidedAnswers?.topic ?? 'not specified'}

Now you are having a free conversation to better understand their needs.

Available advisors on the platform:
${JSON.stringify(advisorContext, null, 2)}

Your conversation rules:
1. Be warm, empathetic and spiritually attuned in tone
2. Ask ONE follow-up question at a time to understand their situation better
3. After 2-3 exchanges, you have enough to make a recommendation
4. When recommending, suggest 2-3 specific advisors BY NAME with a personalized reason for each
5. Format advisor recommendations clearly with their name, specialty and why they match
6. Keep all responses under 4 sentences
7. Never be generic — always reference what the user actually told you
8. End recommendations with "Would you like to connect with one of them?"

Tone: mystical, warm, wise, concise`

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 300,
          system: systemPrompt,
          messages: [
            ...conversationHistory,
            { role: 'user', content: userMessage },
          ],
        }),
      })

      const data = await response.json()
      const reply = data.content[0]?.text ?? ''

      // Extract recommended advisor IDs if mentioned by name
      const mentionedAdvisors = advisors?.filter((a: any) =>
        reply.toLowerCase().includes(a.full_name.toLowerCase())
      ).map((a: any) => a.id) ?? []

      const updatedHistory = [
        ...conversationHistory,
        { role: 'user', content: userMessage },
        { role: 'assistant', content: reply },
      ]

      await supabase
        .from('matching_sessions')
        .update({
          conversation: updatedHistory,
          ...(mentionedAdvisors.length > 0 ? { recommended_advisor_ids: mentionedAdvisors } : {}),
        })
        .eq('id', matchingSessionId)

      return new Response(JSON.stringify({
        reply,
        recommendedAdvisorIds: mentionedAdvisors,
        hasRecommendations: mentionedAdvisors.length > 0,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

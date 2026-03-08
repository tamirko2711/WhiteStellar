// ============================================================
// Supabase Edge Function — prescreen-agent
// Warms up new clients before the advisor joins a chat session.
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
    const {
      action,
      prescreenSessionId,
      clientMessage,
      advisorName,
      advisorCategory,
      advisorSpecializations,
      conversationHistory,
    } = await req.json()

    // ── action: 'message' — generate AI agent reply ──────────

    if (action === 'message') {
      const systemPrompt = `You are a warm, empathetic connection assistant on WhiteStellar, a psychic platform.

You are holding the space for ${advisorName}, a ${advisorCategory} advisor specializing in ${advisorSpecializations?.join(', ')}.
${advisorName} is getting ready to join and will be with the client shortly.

Your role is to:
1. Make the client feel heard, safe and understood
2. Gently draw out what brought them here today
3. Ask natural follow-up questions that help understand their situation
4. Keep the conversation warm, mystical and professional
5. NEVER reveal you are an AI
6. NEVER give actual psychic readings or predictions
7. Keep responses concise — 1-3 sentences maximum
8. After the client has shared their situation, let them know ${advisorName} will be joining shortly

Opening message format (first message only):
"${advisorName} is getting ready for your session — tell me what's on your mind ✨"

Tone: warm, spiritual, non-judgmental, curious`

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 150,
          system: systemPrompt,
          messages: [
            ...conversationHistory,
            { role: 'user', content: clientMessage },
          ],
        }),
      })

      const data = await response.json()
      const agentReply = data.content[0]?.text ?? ''

      const updatedHistory = [
        ...conversationHistory,
        { role: 'user', content: clientMessage },
        { role: 'assistant', content: agentReply },
      ]

      await supabase
        .from('prescreen_sessions')
        .update({ conversation: updatedHistory, updated_at: new Date().toISOString() })
        .eq('id', prescreenSessionId)

      const clientMessages = updatedHistory.filter(m => m.role === 'user')
      const shouldEvaluate = clientMessages.length >= 3 ||
        clientMessage.toLowerCase().includes('advisor') ||
        clientMessage.toLowerCase().includes('ready') ||
        clientMessage.length > 200

      return new Response(JSON.stringify({
        reply: agentReply,
        shouldEvaluate,
        messageCount: clientMessages.length,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // ── action: 'evaluate' — score intent + brief advisor ────

    if (action === 'evaluate') {
      const evaluationPrompt = `You are an expert at evaluating psychic platform client intent.

Analyze this conversation between a client and a pre-screen assistant, then provide:
1. Intent score: "high", "medium", or "low"
2. Brief reasoning (1-2 sentences)
3. A recommended opening line for ${advisorName} to use when joining

Scoring criteria:
HIGH: Client shared specific, detailed situation. Emotionally invested. Likely to continue beyond free minutes.
MEDIUM: Client shared some context. Moderate engagement. 50/50 chance of continuing.
LOW: Vague responses, one-word answers, seems to just be testing. Likely to drop off.

Conversation:
${conversationHistory.map((m: { role: string; content: string }) =>
  `${m.role === 'user' ? 'Client' : 'Assistant'}: ${m.content}`
).join('\n')}

Respond ONLY with valid JSON in this exact format:
{
  "intent_score": "high" | "medium" | "low",
  "score_reasoning": "brief explanation",
  "recommended_opening": "exact opening line for advisor to say when joining"
}`

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
          messages: [{ role: 'user', content: evaluationPrompt }],
        }),
      })

      const data = await response.json()
      const rawText = data.content[0]?.text ?? '{}'
      const evaluation = JSON.parse(rawText.replace(/```json|```/g, '').trim())

      await supabase
        .from('prescreen_sessions')
        .update({
          intent_score: evaluation.intent_score,
          score_reasoning: evaluation.score_reasoning,
          recommended_opening: evaluation.recommended_opening,
          handoff_triggered: true,
          handoff_reason: 'sufficient_engagement',
          updated_at: new Date().toISOString(),
        })
        .eq('id', prescreenSessionId)

      // Notify advisor via notification
      const { data: prescreen } = await supabase
        .from('prescreen_sessions')
        .select('advisor_id, session_id')
        .eq('id', prescreenSessionId)
        .single()

      if (prescreen) {
        const { data: advisor } = await supabase
          .from('advisors')
          .select('user_id')
          .eq('id', prescreen.advisor_id)
          .single()

        if (advisor) {
          await supabase.from('notifications').insert({
            user_id: advisor.user_id,
            type: 'prescreen_complete',
            title: '⚡ Quality Client Ready',
            message: `Intent: ${evaluation.intent_score.toUpperCase()} — ${evaluation.score_reasoning}`,
            metadata: {
              session_id: prescreen.session_id,
              prescreenSessionId,
              intent_score: evaluation.intent_score,
              recommended_opening: evaluation.recommended_opening,
            },
            is_read: false,
          })
        }
      }

      return new Response(JSON.stringify(evaluation), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
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

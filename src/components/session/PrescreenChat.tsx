// ============================================================
// WhiteStellar — Pre-Screen Chat Component
// src/components/session/PrescreenChat.tsx
// Warms up new clients before the advisor joins a session.
// ============================================================

import { useState, useEffect, useRef } from 'react'
import { sendPrescreenMessage, evaluateClient } from '../../lib/api/prescreen'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

interface PrescreenChatProps {
  prescreenSessionId: string
  advisorName: string
  advisorAvatar: string
  advisorCategory: string
  advisorSpecializations: string[]
  onHandoff: () => void
}

export function PrescreenChat({
  prescreenSessionId,
  advisorName,
  advisorAvatar,
  advisorCategory,
  advisorSpecializations,
  onHandoff,
}: PrescreenChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isHandingOff, setIsHandingOff] = useState(false)
  const [conversationHistory, setConversationHistory] = useState<{ role: string; content: string }[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Opening message on mount
  useEffect(() => {
    const opening = `${advisorName} is getting ready for your session — tell me what's on your mind ✨`
    const openingMsg: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: opening,
      createdAt: new Date().toISOString(),
    }
    setMessages([openingMsg])
    setConversationHistory([{ role: 'assistant', content: opening }])
  }, [advisorName])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  async function handleSend() {
    if (!inputText.trim() || isTyping || isHandingOff) return
    const userMessage = inputText.trim()
    setInputText('')

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userMessage,
      createdAt: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])
    setIsTyping(true)

    try {
      const { reply, shouldEvaluate } = await sendPrescreenMessage({
        prescreenSessionId,
        clientMessage: userMessage,
        advisorName,
        advisorCategory,
        advisorSpecializations,
        conversationHistory,
      })

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: reply,
        createdAt: new Date().toISOString(),
      }
      setMessages(prev => [...prev, assistantMsg])

      const updatedHistory = [
        ...conversationHistory,
        { role: 'user', content: userMessage },
        { role: 'assistant', content: reply },
      ]
      setConversationHistory(updatedHistory)

      if (shouldEvaluate) {
        setIsHandingOff(true)
        await evaluateClient({ prescreenSessionId, advisorName, conversationHistory: updatedHistory })

        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: `${advisorName} is joining your session now ✨`,
            createdAt: new Date().toISOString(),
          }])
          setTimeout(onHandoff, 2000)
        }, 1000)
      }
    } catch {
      // On error, fall through to real advisor immediately
      onHandoff()
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <>
      <style>{`
        @keyframes ps-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

        {/* Header */}
        <div style={{
          padding: '16px', borderBottom: '1px solid #1E2D45',
          display: 'flex', alignItems: 'center', gap: '12px',
          background: '#0D1221',
        }}>
          <div style={{ position: 'relative' }}>
            <img
              src={advisorAvatar} alt={advisorName}
              style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #C9A84C' }}
            />
            <div style={{
              position: 'absolute', bottom: 0, right: 0,
              width: '10px', height: '10px', borderRadius: '50%',
              background: '#C9A84C', border: '2px solid #0B0F1A',
            }} />
          </div>
          <div>
            <p style={{ color: '#F0F4FF', fontWeight: 600, fontSize: '14px', margin: 0 }}>{advisorName}</p>
            <p style={{ color: '#C9A84C', fontSize: '12px', margin: 0 }}>Getting ready...</p>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <span style={{
              background: 'rgba(45,212,191,0.12)', color: '#2DD4BF',
              border: '1px solid rgba(45,212,191,0.3)',
              borderRadius: '20px', padding: '3px 10px', fontSize: '11px', fontWeight: 600,
            }}>
              ✦ Free warmup
            </span>
          </div>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '16px',
          display: 'flex', flexDirection: 'column', gap: '12px',
          scrollbarWidth: 'thin', scrollbarColor: '#1A2235 transparent',
        }}>
          {messages.map(msg => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                gap: '8px', alignItems: 'flex-end',
              }}
            >
              {msg.role === 'assistant' && (
                <img
                  src={advisorAvatar} alt={advisorName}
                  style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                />
              )}
              <div style={{
                maxWidth: '75%', padding: '10px 14px',
                borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: msg.role === 'user' ? 'rgba(201,168,76,0.18)' : '#131929',
                color: '#F0F4FF', fontSize: '14px', lineHeight: '1.55',
                border: msg.role === 'assistant' ? '1px solid #1E2D45' : '1px solid rgba(201,168,76,0.35)',
              }}>
                {msg.content}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
              <img src={advisorAvatar} alt={advisorName}
                style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
              <div style={{
                padding: '12px 16px', borderRadius: '16px 16px 16px 4px',
                background: '#131929', border: '1px solid #1E2D45',
                display: 'flex', gap: '4px', alignItems: 'center',
              }}>
                {[0, 0.2, 0.4].map((delay, i) => (
                  <div key={i} style={{
                    width: '6px', height: '6px', borderRadius: '50%', background: '#8B9BB4',
                    animation: `ps-bounce 1s ease-in-out ${delay}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: '12px 16px', borderTop: '1px solid #1E2D45',
          display: 'flex', gap: '8px', alignItems: 'flex-end',
          background: '#0D1221',
        }}>
          <textarea
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            placeholder="Share what's on your mind..."
            disabled={isHandingOff}
            rows={1}
            style={{
              flex: 1, background: '#131929', border: '1px solid #1E2D45',
              borderRadius: '12px', padding: '10px 14px', color: '#F0F4FF',
              fontSize: '14px', resize: 'none', outline: 'none',
              fontFamily: 'Inter, sans-serif',
              opacity: isHandingOff ? 0.5 : 1,
              lineHeight: '1.5',
            }}
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isTyping || isHandingOff}
            style={{
              padding: '10px 20px', borderRadius: '12px', border: 'none',
              background: inputText.trim() && !isTyping ? '#C9A84C' : '#1E2D45',
              color: inputText.trim() && !isTyping ? '#0B0F1A' : '#8B9BB4',
              fontWeight: 700, cursor: inputText.trim() && !isTyping ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s', flexShrink: 0,
            }}
          >
            Send
          </button>
        </div>
      </div>
    </>
  )
}

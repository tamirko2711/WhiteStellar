// ============================================================
// WhiteStellar — Agora RTC Session Hook
// src/hooks/useAgoraSession.ts
// ============================================================
// Encapsulates Agora join / publish / subscribe logic.
// Used by AudioSessionPage and VideoSessionPage.
// Channel name = String(supabaseSessionId) — unique per session.
// UID assignment: client = 1, advisor = 2 (unique within channel).
// Token mode: fetched from supabase/functions/agora-token Edge Function.
// ============================================================

import { useEffect, useRef, useState, useCallback } from 'react'
import AgoraRTC from 'agora-rtc-sdk-ng'
import type {
  IAgoraRTCClient,
  ILocalAudioTrack,
  ILocalVideoTrack,
  IRemoteAudioTrack,
  IRemoteVideoTrack,
} from 'agora-rtc-sdk-ng'
import { useAuthStore } from '../store/authStore'

const APP_ID          = (import.meta.env.VITE_AGORA_APP_ID     as string) ?? ''
const SUPABASE_URL    = (import.meta.env.VITE_SUPABASE_URL     as string) ?? ''
const SUPABASE_ANON   = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ?? ''

AgoraRTC.setLogLevel(2) // 2 = warning only (change to 0 for verbose debugging)

// ── Token helper ────────────────────────────────────────────
async function fetchAgoraToken(channel: string, uid: number): Promise<string> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/agora-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON}`,
    },
    body: JSON.stringify({ channel, uid }),
  })
  const data = await res.json()
  if (!data.token) throw new Error(data.error ?? 'Failed to get Agora token')
  return data.token as string
}

export interface AgoraSessionState {
  localAudioTrack: ILocalAudioTrack | null
  localVideoTrack: ILocalVideoTrack | null
  remoteAudioTrack: IRemoteAudioTrack | null
  remoteVideoTrack: IRemoteVideoTrack | null
  isJoined: boolean
  error: string | null
  /** Call whenever isMuted changes in the store */
  setMuted: (muted: boolean) => void
  /** Call whenever isCameraOff changes in the store (video only) */
  setCameraOff: (off: boolean) => void
}

interface UseAgoraSessionOptions {
  /** Pass String(supabaseSessionId). Pass null to skip joining (dev/no-session). */
  channel: string | null
  mode: 'audio' | 'video'
}

export function useAgoraSession({ channel, mode }: UseAgoraSessionOptions): AgoraSessionState {
  const userType = useAuthStore(s => s.userType)
  // Deterministic UIDs within the channel (only need to be unique per channel)
  const uid = userType === 'advisor' ? 2 : 1

  const clientRef     = useRef<IAgoraRTCClient | null>(null)
  const localAudioRef = useRef<ILocalAudioTrack | null>(null)
  const localVideoRef = useRef<ILocalVideoTrack | null>(null)

  const [remoteAudioTrack, setRemoteAudioTrack] = useState<IRemoteAudioTrack | null>(null)
  const [remoteVideoTrack, setRemoteVideoTrack] = useState<IRemoteVideoTrack | null>(null)
  const [isJoined, setIsJoined]                 = useState(false)
  const [error, setError]                       = useState<string | null>(null)

  useEffect(() => {
    if (!channel || !APP_ID) {
      if (!APP_ID) setError('VITE_AGORA_APP_ID is not set in .env')
      return
    }

    let destroyed = false

    console.log('[Agora] Joining — appId:', APP_ID.slice(0, 8) + '…', '| channel:', channel, '| uid:', uid, '| mode:', mode)

    async function init() {
      try {
        // ── Fetch RTC token from Edge Function ──────────────
        const token = await fetchAgoraToken(channel!, uid)
        if (destroyed) return

        const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
        clientRef.current = client

        // ── Remote stream subscription ──────────────────────
        client.on('user-published', async (user, mediaType) => {
          await client.subscribe(user, mediaType)
          if (mediaType === 'audio') {
            user.audioTrack?.play()
            if (!destroyed) setRemoteAudioTrack(user.audioTrack ?? null)
          }
          if (mediaType === 'video') {
            if (!destroyed) setRemoteVideoTrack(user.videoTrack ?? null)
          }
        })

        client.on('user-unpublished', (_user, mediaType) => {
          if (mediaType === 'audio' && !destroyed) setRemoteAudioTrack(null)
          if (mediaType === 'video' && !destroyed) setRemoteVideoTrack(null)
        })

        // ── Join channel with token ─────────────────────────
        await client.join(APP_ID, channel!, token, uid)

        // ── Publish local tracks ────────────────────────────
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack()
        localAudioRef.current = audioTrack

        if (mode === 'video') {
          const videoTrack = await AgoraRTC.createCameraVideoTrack()
          localVideoRef.current = videoTrack
          await client.publish([audioTrack, videoTrack])
        } else {
          await client.publish([audioTrack])
        }

        if (!destroyed) setIsJoined(true)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to join call'
        if (!destroyed) setError(msg)
      }
    }

    init()

    return () => {
      destroyed = true
      localAudioRef.current?.close()
      localVideoRef.current?.close()
      localAudioRef.current = null
      localVideoRef.current = null
      clientRef.current?.leave().catch(() => {})
      clientRef.current = null
    }
  }, [channel, mode, uid])

  const setMuted = useCallback((muted: boolean) => {
    localAudioRef.current?.setMuted(muted)
  }, [])

  const setCameraOff = useCallback((off: boolean) => {
    localVideoRef.current?.setMuted(off)
  }, [])

  return {
    localAudioTrack: localAudioRef.current,
    localVideoTrack: localVideoRef.current,
    remoteAudioTrack,
    remoteVideoTrack,
    isJoined,
    error,
    setMuted,
    setCameraOff,
  }
}

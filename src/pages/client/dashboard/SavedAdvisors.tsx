import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HeartOff, Heart, Star, MessageCircle } from 'lucide-react'
import { ADVISORS, type Advisor } from '../../../data/advisors'
import AdvisorCard from '../../../components/AdvisorCard'
import Toast from '../../../components/Toast'
import { supabase } from '../../../lib/supabase'
import { useAuthStore } from '../../../store/authStore'

type SortKey = 'recent' | 'rated' | 'price' | 'online'

const STATUS_ORDER: Record<string, number> = { online: 0, busy: 1, offline: 2 }

function getMinPrice(advisor: Advisor): number {
  const prices = [advisor.pricing.chat, advisor.pricing.audio, advisor.pricing.video]
    .filter((p): p is number => p !== null)
  return prices.length ? Math.min(...prices) : Infinity
}

function sortAdvisors(list: Advisor[], sort: SortKey): Advisor[] {
  const copy = [...list]
  switch (sort) {
    case 'rated':  return copy.sort((a, b) => b.rating - a.rating)
    case 'price':  return copy.sort((a, b) => getMinPrice(a) - getMinPrice(b))
    case 'online': return copy.sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status])
    default:       return copy // 'recent' keeps savedAdvisors order
  }
}

// ─── Saved advisor card wrapper (adds HeartOff remove button) ─

function SavedCard({ advisor, onRemove }: { advisor: Advisor; onRemove: () => void }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      style={{ position: 'relative' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <AdvisorCard advisor={advisor} />
      {hovered && (
        <button
          onClick={e => { e.stopPropagation(); onRemove() }}
          title="Remove from saved"
          style={{
            position: 'absolute', top: '8px', right: '8px', zIndex: 10,
            background: 'rgba(11,15,26,0.85)', border: '1px solid rgba(239,68,68,0.4)',
            borderRadius: '50%', width: '30px', height: '30px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#EF4444',
          }}
        >
          <HeartOff size={13} />
        </button>
      )}
    </div>
  )
}

// ─── Suggestion strip card ────────────────────────────────────

function SuggestionCard({ advisor }: { advisor: Advisor }) {
  const navigate = useNavigate()
  const status = advisor.status
  const statusColor = status === 'online' ? '#2DD4BF' : status === 'busy' ? '#F59E0B' : '#4B5563'
  const minPrice = getMinPrice(advisor)

  return (
    <div
      onClick={() => navigate(`/advisor/${advisor.id}`)}
      style={{
        background: '#131929', border: '1px solid #1E2D45', borderRadius: '12px',
        padding: '16px', cursor: 'pointer', flexShrink: 0, width: '200px',
        transition: 'all 0.2s',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.transform = 'translateY(-3px)'
        el.style.boxShadow = '0 6px 24px rgba(201,168,76,0.12)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.transform = 'translateY(0)'
        el.style.boxShadow = 'none'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
        <div style={{ position: 'relative' }}>
          <img
            src={advisor.avatar}
            alt={advisor.fullName}
            style={{ width: '56px', height: '56px', borderRadius: '50%' }}
          />
          <span style={{
            position: 'absolute', bottom: 0, right: 0,
            width: '12px', height: '12px', borderRadius: '50%',
            background: statusColor, border: '2px solid #131929',
          }} />
        </div>
        <div>
          <p style={{ fontWeight: 700, color: '#F0F4FF', fontSize: '13px', margin: '0 0 2px' }}>{advisor.fullName}</p>
          <p style={{ color: '#8B9BB4', fontSize: '11px', margin: '0 0 4px' }}>
            {advisor.specializations[0]?.title ?? 'Advisor'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            <Star size={11} fill="#C9A84C" color="#C9A84C" />
            <span style={{ color: '#F0F4FF', fontSize: '11px', fontWeight: 600 }}>{advisor.rating.toFixed(1)}</span>
          </div>
        </div>
        <p style={{ color: '#C9A84C', fontWeight: 700, fontSize: '12px', margin: 0 }}>
          {minPrice !== Infinity ? `from $${minPrice.toFixed(2)}/min` : 'N/A'}
        </p>
      </div>
    </div>
  )
}

// ─── Saved Advisors page ──────────────────────────────────────

export default function SavedAdvisors() {
  const { user } = useAuthStore()
  const [savedAdvisors, setSavedAdvisors] = useState<Advisor[]>([])
  const [sort, setSort] = useState<SortKey>('recent')
  const [toast, setToast] = useState({ msg: '', visible: false })

  const isDevMode = user?.id?.startsWith('dev-')

  useEffect(() => {
    if (!user?.id) return

    if (isDevMode) {
      // Dev mode: use mock data
      const mockIds = new Set([1, 2, 3]) // mock saved IDs
      setSavedAdvisors(ADVISORS.filter(a => mockIds.has(a.id)))
      return
    }

    const fetchSaved = async () => {
      const { data: savedRows } = await supabase
        .from('saved_advisors')
        .select('advisor_id')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })
      if (!savedRows || savedRows.length === 0) return

      const ids = savedRows.map((r: { advisor_id: number }) => r.advisor_id)
      const { data: advisorRows } = await supabase
        .from('advisors')
        .select('id, full_name, avatar, short_bio, status, rating, review_count, is_top_advisor, chat_price, audio_price, video_price, total_sessions')
        .in('id', ids)
      if (!advisorRows) return

      // Preserve saved order
      const byId = Object.fromEntries(advisorRows.map((a: any) => [a.id, a]))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setSavedAdvisors(ids.map((id: number) => byId[id]).filter(Boolean).map((a: any): Advisor => ({
        id: a.id,
        userId: 0,
        fullName: a.full_name ?? '',
        shortBio: a.short_bio ?? '',
        longBio: '',
        avatar: a.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(a.full_name ?? 'A')}&background=1E2D45&color=C9A84C`,
        backgroundImage: '',
        status: a.status ?? 'offline',
        accountStatus: 'active',
        isTopAdvisor: a.is_top_advisor ?? false,
        isNew: !a.is_top_advisor,
        languages: [],
        categories: [],
        specializations: [],
        skillsAndMethods: [],
        sessionTypes: [
          a.chat_price != null ? 'chat' : null,
          a.audio_price != null ? 'audio' : null,
          a.video_price != null ? 'video' : null,
        ].filter(Boolean) as Advisor['sessionTypes'],
        pricing: { chat: a.chat_price, audio: a.audio_price, video: a.video_price },
        rating: a.rating ?? 5.0,
        reviewCount: a.review_count ?? 0,
        totalSessions: a.total_sessions ?? 0,
        yearsActive: 0,
        responseTime: '—',
        withdrawalMethod: 'paypal',
        joinedAt: new Date().toISOString(),
        reviews: [],
      })))
    }
    fetchSaved().catch(console.error)
  }, [user?.id, isDevMode])

  function showToast(msg: string) {
    setToast({ msg, visible: true })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2500)
  }

  async function handleRemove(advisorId: number) {
    setSavedAdvisors(prev => prev.filter(a => a.id !== advisorId))
    showToast('Removed from saved advisors')
    if (user?.id) {
      await supabase
        .from('saved_advisors')
        .delete()
        .eq('client_id', user.id)
        .eq('advisor_id', advisorId)
    }
  }

  const savedList = sortAdvisors(savedAdvisors, sort)
  const savedIdSet = new Set(savedAdvisors.map(a => a.id))

  // Suggestions: advisors NOT already saved (from mock data for now)
  const suggestions = ADVISORS.filter(a => !savedIdSet.has(a.id)).slice(0, 4)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', fontWeight: 700, color: '#F0F4FF', margin: '0 0 4px' }}>
            Your Saved Advisors
          </h1>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(201,168,76,0.1)', color: '#C9A84C',
            border: '1px solid rgba(201,168,76,0.3)',
            borderRadius: '20px', padding: '3px 12px', fontSize: '12px', fontWeight: 600,
          }}>
            <Heart size={12} />
            {savedList.length} advisor{savedList.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Sort dropdown */}
        <select
          value={sort}
          onChange={e => setSort(e.target.value as SortKey)}
          style={{
            background: '#131929', border: '1px solid #1E2D45', borderRadius: '8px',
            color: '#F0F4FF', fontSize: '13px', padding: '8px 12px', cursor: 'pointer',
            outline: 'none',
          }}
        >
          <option value="recent">Recently Added</option>
          <option value="rated">Highest Rated</option>
          <option value="price">Lowest Price</option>
          <option value="online">Online First</option>
        </select>
      </div>

      {/* ── Grid ── */}
      {savedList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Heart size={48} style={{ color: '#1E2D45', margin: '0 auto 16px' }} />
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', color: '#F0F4FF', margin: '0 0 8px' }}>
            No saved advisors yet
          </h3>
          <p style={{ color: '#8B9BB4', fontSize: '14px', margin: '0 0 20px', maxWidth: '380px', marginLeft: 'auto', marginRight: 'auto' }}>
            Browse advisors and tap the heart icon to save your favorites
          </p>
          <Link
            to="/"
            style={{
              background: '#C9A84C', color: '#0B0F1A', borderRadius: '10px',
              padding: '10px 24px', fontWeight: 700, fontSize: '14px', textDecoration: 'none',
            }}
          >
            Explore Advisors
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {savedList.map(advisor => (
            <SavedCard key={advisor.id} advisor={advisor} onRemove={() => handleRemove(advisor.id)} />
          ))}
        </div>
      )}

      {/* ── Suggestions strip ── */}
      {suggestions.length > 0 && (
        <section>
          <h2 style={{
            fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 700,
            color: '#F0F4FF', margin: '0 0 16px',
          }}>
            You Might Also Like
          </h2>
          <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
            {suggestions.map(advisor => (
              <SuggestionCard key={advisor.id} advisor={advisor} />
            ))}
          </div>

          {/* Scroll hint gradient */}
          <style>{`
            .suggestion-strip::-webkit-scrollbar { display: none; }
          `}</style>
        </section>
      )}

      {/* Empty state with no sessions yet */}
      {savedList.length === 0 && (
        <div style={{ textAlign: 'center' }}>
          <MessageCircle size={24} style={{ color: '#1E2D45', margin: '0 auto 8px' }} />
          <p style={{ color: '#4B5563', fontSize: '12px' }}>
            Connect with an advisor to start your journey
          </p>
        </div>
      )}

      <Toast message={toast.msg} visible={toast.visible} />
    </div>
  )
}

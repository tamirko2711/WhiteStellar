// ============================================================
// WhiteStellar — Navbar (redesigned)
// src/components/Navbar.tsx
// ============================================================

import {
  useEffect, useRef, useState, useCallback,
} from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import {
  Search, Wallet, Bell, Menu, X, User, MessageCircle,
  Heart, Settings, LogOut, Star, Zap, ChevronDown,
  Eye, Layers, Moon, Sparkles, TrendingUp,
} from 'lucide-react'
import { CATEGORIES } from '../data/advisors'
import { useAuthStore } from '../store/authStore'
import { useModalStore } from '../store/modalStore'
import { getNotifications, markAllRead as markAllReadApi, subscribeToNotifications } from '../lib/api/notifications'
import type { NotificationType } from '../types'

// ─── DB notification shape ─────────────────────────────────────

interface DbNotification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  is_read: boolean
  created_at: string
}

// ─── helpers ──────────────────────────────────────────────────

function notifIcon(type: NotificationType) {
  if (type === 'new_review') return <Star size={15} />
  if (type === 'advisor_online') return <Zap size={15} />
  return <MessageCircle size={15} />
}

// Reading types for Advisors mega-dropdown
const READING_TYPES = [
  { label: 'Love & Relationships', to: '/category/love-relationships', icon: Heart },
  { label: 'Tarot Readings', to: '/category/tarot', icon: Layers },
  { label: 'Astrology', to: '/category/astrology', icon: Star },
  { label: 'Dream Interpretation', to: '/category/dream-interpretation', icon: Moon },
  { label: 'Spiritual Guidance', to: '/category/spiritual', icon: Sparkles },
  { label: 'Mediumship', to: '/category/mediumship', icon: Zap },
  { label: 'Career & Finance', to: '/category/career-finance', icon: TrendingUp },
  { label: 'Psychic Readings', to: '/category/psychic-readings', icon: Eye },
]

// ─── Expanding search ──────────────────────────────────────────

function ExpandingSearch() {
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="relative flex items-center">
      <div
        className="flex items-center overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          width: open ? '240px' : '0',
          opacity: open ? 1 : 0,
          borderRadius: '8px',
          background: open ? '#131929' : 'transparent',
          border: open ? '1px solid #1E2D45' : '1px solid transparent',
        }}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="Search advisors…"
          className="w-full bg-transparent px-3 py-1.5 text-sm outline-none"
          style={{ color: '#F0F4FF' }}
          onBlur={() => setOpen(false)}
        />
      </div>
      <button
        aria-label="Search"
        className="ml-1 flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-200"
        style={{ color: open ? '#C9A84C' : '#8B9BB4' }}
        onMouseEnter={e => { if (!open) (e.currentTarget as HTMLButtonElement).style.color = '#F0F4FF' }}
        onMouseLeave={e => { if (!open) (e.currentTarget as HTMLButtonElement).style.color = '#8B9BB4' }}
        onClick={() => setOpen(v => !v)}
      >
        <Search size={18} />
      </button>
    </div>
  )
}

// ─── Notification dropdown ─────────────────────────────────────

interface NotifDropdownProps {
  notifications: DbNotification[]
  onClose: () => void
  onMarkAllRead: () => void
}

function NotifDropdown({ notifications, onClose, onMarkAllRead }: NotifDropdownProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full z-50 mt-3 overflow-hidden rounded-xl"
      style={{
        width: '360px',
        background: '#131929',
        border: '1px solid #1E2D45',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid #1E2D45' }}
      >
        <span className="text-sm font-semibold" style={{ color: '#F0F4FF' }}>
          Notifications
        </span>
        <button className="text-xs font-medium" style={{ color: '#C9A84C' }} onClick={onMarkAllRead}>
          Mark all read
        </button>
      </div>
      <div className="max-h-[360px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10">
            <Bell size={28} style={{ color: '#1E2D45' }} />
            <p className="text-sm" style={{ color: '#8B9BB4' }}>No notifications yet</p>
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              className="flex gap-3 px-4 py-3 transition-colors"
              style={{
                background: n.is_read ? 'transparent' : 'rgba(201,168,76,0.04)',
                borderLeft: n.is_read ? '3px solid transparent' : '3px solid rgba(201,168,76,0.5)',
                cursor: 'pointer',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(30,45,69,0.5)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = n.is_read ? 'transparent' : 'rgba(201,168,76,0.04)' }}
            >
              <div
                className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                style={{ background: 'rgba(201,168,76,0.12)', color: '#C9A84C' }}
              >
                {notifIcon(n.type)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-snug" style={{ color: '#F0F4FF' }}>{n.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed" style={{ color: '#8B9BB4' }}>{n.message}</p>
                <p className="mt-1 text-[11px]" style={{ color: '#4B5563' }}>
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                </p>
              </div>
              {!n.is_read && (
                <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: '#C9A84C' }} />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ─── Profile dropdown ──────────────────────────────────────────

function ProfileDropdown({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const MENU_ITEMS = [
    { icon: <User size={15} />,          label: 'My Profile',        to: '/dashboard/profile'  },
    { icon: <Wallet size={15} />,        label: 'Wallet & Payments', to: '/dashboard/wallet'   },
    { icon: <MessageCircle size={15} />, label: 'My Sessions',       to: '/dashboard/sessions' },
    { icon: <Heart size={15} />,         label: 'Saved Advisors',    to: '/dashboard/saved'    },
    { icon: <Settings size={15} />,      label: 'Account Settings',  to: '/dashboard/account'  },
  ] as const

  function go(to: string) {
    onClose()
    navigate(to)
  }

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full z-50 mt-3 overflow-hidden rounded-xl"
      style={{
        width: '220px',
        background: '#131929',
        border: '1px solid #1E2D45',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}
    >
      <div
        className="flex flex-col items-center gap-2 px-4 py-4"
        style={{ borderBottom: '1px solid #1E2D45' }}
      >
        <img
          src={user?.avatar}
          alt={user?.fullName}
          className="rounded-full object-cover"
          style={{ width: '48px', height: '48px' }}
        />
        <div className="text-center">
          <p className="text-sm font-semibold" style={{ color: '#F0F4FF' }}>{user?.fullName}</p>
          <span
            className="mt-1 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
            style={{ background: 'rgba(45,212,191,0.15)', color: '#2DD4BF' }}
          >
            Client
          </span>
        </div>
      </div>
      <div className="py-1">
        {MENU_ITEMS.map(item => (
          <button
            key={item.label}
            onClick={() => go(item.to)}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors"
            style={{ color: '#8B9BB4' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.color = '#F0F4FF'
              ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(30,45,69,0.6)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.color = '#8B9BB4'
              ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
            }}
          >
            <span style={{ color: '#4B5563' }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
        <div style={{ borderTop: '1px solid #1E2D45', margin: '4px 0' }} />
        <button
          onClick={() => { logout(); onClose() }}
          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors"
          style={{ color: '#8B9BB4' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.color = '#EF4444'
            ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.06)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.color = '#8B9BB4'
            ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
          }}
        >
          <span style={{ color: 'inherit' }}><LogOut size={15} /></span>
          Sign Out
        </button>
      </div>
    </div>
  )
}

// ─── Advisors Mega Dropdown ────────────────────────────────────

function AdvisorsMegaDropdown({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
        marginTop: '12px', zIndex: 50,
        background: '#131929', border: '1px solid #1E2D45',
        borderRadius: '16px', padding: '20px',
        width: '480px',
        boxShadow: '0 12px 48px rgba(0,0,0,0.6)',
      }}
    >
      <p style={{ color: '#4B5563', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 14px' }}>
        Browse by Reading Type
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '16px' }}>
        {READING_TYPES.map(item => (
          <button
            key={item.to}
            onClick={() => { navigate(item.to); onClose() }}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', borderRadius: '10px',
              background: 'transparent', border: 'none', cursor: 'pointer',
              textAlign: 'left', transition: 'background 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(30,45,69,0.8)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
          >
            <div style={{
              width: '28px', height: '28px', borderRadius: '7px', flexShrink: 0,
              background: 'rgba(201,168,76,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <item.icon size={14} color="#C9A84C" />
            </div>
            <span style={{ color: '#F0F4FF', fontSize: '13px', fontWeight: 500 }}>{item.label}</span>
          </button>
        ))}
      </div>
      <div style={{ borderTop: '1px solid #1E2D45', paddingTop: '12px', display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={() => { navigate('/'); onClose() }}
          style={{
            background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)',
            borderRadius: '8px', padding: '8px 18px',
            color: '#C9A84C', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
          }}
        >
          Browse All Advisors
        </button>
      </div>
    </div>
  )
}

// ─── Categories Dropdown ───────────────────────────────────────

function CategoriesDropdown({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
        marginTop: '12px', zIndex: 50,
        background: '#131929', border: '1px solid #1E2D45',
        borderRadius: '14px', padding: '8px',
        width: '240px',
        boxShadow: '0 12px 48px rgba(0,0,0,0.6)',
      }}
    >
      {CATEGORIES.map(cat => (
        <button
          key={cat.slug}
          onClick={() => { navigate(`/category/${cat.slug}`); onClose() }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            width: '100%', padding: '9px 12px', borderRadius: '8px',
            background: 'transparent', border: 'none', cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(30,45,69,0.8)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
        >
          <span style={{ color: '#F0F4FF', fontSize: '13px', fontWeight: 500 }}>{cat.title}</span>
          <span style={{ color: '#4B5563', fontSize: '11px' }}>{cat.advisorCount}</span>
        </button>
      ))}
    </div>
  )
}

// ─── Mobile Drawer ─────────────────────────────────────────────

function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { isLoggedIn, user, logout } = useAuthStore()
  const { openAuthModal } = useModalStore()
  const navigate = useNavigate()
  const [advisorsOpen, setAdvisorsOpen] = useState(false)
  const [categoriesOpen, setCategoriesOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  function go(path: string) {
    navigate(path)
    onClose()
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{
          background: 'rgba(0,0,0,0.6)',
          pointerEvents: open ? 'auto' : 'none',
          opacity: open ? 1 : 0,
        }}
        onClick={onClose}
      />
      <div
        className="fixed right-0 top-0 z-50 flex h-full flex-col overflow-y-auto"
        style={{
          width: '280px',
          background: '#0B0F1A',
          borderLeft: '1px solid #1E2D45',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid #1E2D45', flexShrink: 0 }}
        >
          <LogoMark />
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full"
            style={{ color: '#8B9BB4' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 px-3 py-4">

          {/* Advisors accordion */}
          <button
            onClick={() => setAdvisorsOpen(v => !v)}
            className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
            style={{ color: '#8B9BB4', background: 'transparent', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
          >
            Advisors
            <ChevronDown size={16} style={{ transform: advisorsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
          {advisorsOpen && (
            <div style={{ paddingLeft: '12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {READING_TYPES.map(item => (
                <button
                  key={item.to}
                  onClick={() => go(item.to)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '7px 10px', borderRadius: '8px',
                    background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
                    color: '#8B9BB4', fontSize: '13px',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#F0F4FF' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#8B9BB4' }}
                >
                  <item.icon size={13} />
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {/* Categories accordion */}
          <button
            onClick={() => setCategoriesOpen(v => !v)}
            className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
            style={{ color: '#8B9BB4', background: 'transparent', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
          >
            Categories
            <ChevronDown size={16} style={{ transform: categoriesOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
          {categoriesOpen && (
            <div style={{ paddingLeft: '12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.slug}
                  onClick={() => go(`/category/${cat.slug}`)}
                  style={{
                    padding: '7px 10px', borderRadius: '8px',
                    background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
                    color: '#8B9BB4', fontSize: '13px',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#F0F4FF' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#8B9BB4' }}
                >
                  {cat.title}
                </button>
              ))}
            </div>
          )}

          {/* Zodiac AI */}
          <button
            onClick={() => go('/zodiac-ai')}
            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
            style={{ color: '#8B9BB4', background: 'transparent', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
          >
            <span style={{ color: '#C9A84C' }}>✦</span>
            Zodiac AI
          </button>

          {/* Articles */}
          <button
            onClick={() => go('/articles')}
            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
            style={{ color: '#8B9BB4', background: 'transparent', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
          >
            Articles
          </button>
        </nav>

        {/* Auth section */}
        <div
          className="mt-auto px-5 py-5"
          style={{ borderTop: '1px solid #1E2D45', flexShrink: 0 }}
        >
          {isLoggedIn && user ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar}
                  alt={user.fullName}
                  className="rounded-full object-cover"
                  style={{ width: '40px', height: '40px' }}
                />
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#F0F4FF' }}>{user.fullName}</p>
                  <p className="text-xs" style={{ color: '#C9A84C' }}>${user.walletBalance.toFixed(2)} balance</p>
                </div>
              </div>
              <button
                onClick={() => { logout(); onClose() }}
                className="w-full rounded-lg py-2.5 text-sm font-medium"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <button
                onClick={() => { onClose(); openAuthModal('login') }}
                className="w-full rounded-xl py-2.5 text-sm font-semibold"
                style={{ border: '1px solid rgba(240,244,255,0.3)', color: '#F0F4FF', background: 'transparent' }}
              >
                Sign In
              </button>
              <button
                onClick={() => { onClose(); openAuthModal('register') }}
                className="w-full rounded-full py-2.5 text-sm font-semibold"
                style={{ background: '#C9A84C', color: '#0B0F1A' }}
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ─── Logo mark ─────────────────────────────────────────────────

function LogoMark() {
  return (
    <NavLink to="/" className="flex items-center gap-2">
      <svg
        width="20" height="20" viewBox="0 0 20 20"
        fill="#C9A84C"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <polygon points="10,1 12.9,7.6 20,8.3 14.5,13.5 16.2,20.6 10,17 3.8,20.6 5.5,13.5 0,8.3 7.1,7.6" />
      </svg>
      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em' }}>
        <span style={{ color: '#F0F4FF' }}>White</span>
        <span style={{ color: '#C9A84C' }}>Stellar</span>
      </span>
    </NavLink>
  )
}

// ─── Dropdown nav item ─────────────────────────────────────────

function NavDropdownItem({
  label, hasChevron, isActive, onMouseEnter, onMouseLeave, onClick,
}: {
  label: React.ReactNode
  hasChevron?: boolean
  isActive?: boolean
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        display: 'flex', alignItems: 'center', gap: '4px',
        background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0',
        color: isActive ? '#F0F4FF' : '#8B9BB4',
        fontSize: '14px', fontWeight: 500,
        borderBottom: isActive ? '2px solid #C9A84C' : '2px solid transparent',
        transition: 'color 0.15s',
      }}
    >
      {label}
      {hasChevron && <ChevronDown size={14} />}
    </button>
  )
}

// ─── Main Navbar ───────────────────────────────────────────────

export default function Navbar() {
  const { isLoggedIn, user } = useAuthStore()
  const { openAuthModal } = useModalStore()

  const [scrolled, setScrolled] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [advisorsOpen, setAdvisorsOpen] = useState(false)
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const [notifications, setNotifications] = useState<DbNotification[]>([])

  // hover delay timers
  const advisorsTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const categoriesTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const unreadCount = notifications.filter(n => !n.is_read).length

  // Load notifications + real-time subscription
  useEffect(() => {
    if (!user?.id) return
    getNotifications(user.id)
      .then(data => setNotifications(data as DbNotification[]))
      .catch(console.error)

    const channel = subscribeToNotifications(user.id, (newNotif) => {
      setNotifications(prev => [newNotif as DbNotification, ...prev])
    })
    return () => { channel.unsubscribe() }
  }, [user?.id])

  async function handleMarkAllRead() {
    if (!user?.id) return
    await markAllReadApi(user.id)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 20) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 768) setDrawerOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const closeNotif = useCallback(() => setNotifOpen(false), [])
  const closeProfile = useCallback(() => setProfileOpen(false), [])

  function openAdvisors() {
    if (advisorsTimer.current) clearTimeout(advisorsTimer.current)
    setAdvisorsOpen(true)
  }
  function closeAdvisors() {
    advisorsTimer.current = setTimeout(() => setAdvisorsOpen(false), 150)
  }
  function openCategories() {
    if (categoriesTimer.current) clearTimeout(categoriesTimer.current)
    setCategoriesOpen(true)
  }
  function closeCategories() {
    categoriesTimer.current = setTimeout(() => setCategoriesOpen(false), 150)
  }

  return (
    <>
      <header
        className="sticky top-0 z-50 w-full transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(11,15,26,0.95)' : '#0B0F1A',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #1E2D45',
          boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.4)' : 'none',
        }}
      >
        <div
          className="mx-auto flex max-w-[1280px] items-center justify-between px-6"
          style={{ height: '64px' }}
        >

          {/* ── Logo ── */}
          <LogoMark />

          {/* ── Center nav (desktop) ── */}
          <nav className="hidden items-center gap-7 md:flex">

            {/* Advisors — mega dropdown */}
            <div
              style={{ position: 'relative' }}
              onMouseEnter={openAdvisors}
              onMouseLeave={closeAdvisors}
            >
              <NavDropdownItem label="Advisors" hasChevron isActive={advisorsOpen} />
              {advisorsOpen && (
                <AdvisorsMegaDropdown
                  onClose={() => setAdvisorsOpen(false)}
                />
              )}
            </div>

            {/* Categories — dropdown */}
            <div
              style={{ position: 'relative' }}
              onMouseEnter={openCategories}
              onMouseLeave={closeCategories}
            >
              <NavDropdownItem label="Categories" hasChevron isActive={categoriesOpen} />
              {categoriesOpen && (
                <CategoriesDropdown
                  onClose={() => setCategoriesOpen(false)}
                />
              )}
            </div>

            {/* Zodiac AI */}
            <NavLink
              to="/zodiac-ai"
              className="relative flex items-center gap-1.5 text-sm font-medium transition-colors duration-200"
              style={({ isActive }) => ({
                color: isActive ? '#C9A84C' : '#8B9BB4',
                borderBottom: isActive ? '2px solid #C9A84C' : '2px solid transparent',
                paddingBottom: '2px',
              })}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#F0F4FF' }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLAnchorElement
                if (el.getAttribute('aria-current') !== 'page') el.style.color = '#8B9BB4'
              }}
            >
              <span style={{ color: '#C9A84C', fontSize: '12px' }}>✦</span>
              Zodiac AI
            </NavLink>

            {/* Articles */}
            <NavLink
              to="/articles"
              className="relative flex items-center gap-1.5 text-sm font-medium transition-colors duration-200"
              style={({ isActive }) => ({
                color: isActive ? '#F0F4FF' : '#8B9BB4',
                borderBottom: isActive ? '2px solid #C9A84C' : '2px solid transparent',
                paddingBottom: '2px',
              })}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#F0F4FF' }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLAnchorElement
                if (el.getAttribute('aria-current') !== 'page') el.style.color = '#8B9BB4'
              }}
            >
              Articles
            </NavLink>
          </nav>

          {/* ── Right actions ── */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex">
              <ExpandingSearch />
            </div>

            {isLoggedIn && user ? (
              <>
                <NavLink
                  to="/dashboard/wallet"
                  className="hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors md:flex"
                  style={{
                    background: '#131929',
                    border: '1px solid rgba(201,168,76,0.4)',
                    color: '#C9A84C',
                  }}
                >
                  <Wallet size={14} />
                  ${user.walletBalance.toFixed(2)}
                </NavLink>

                <div className="relative hidden md:block">
                  <button
                    aria-label="Notifications"
                    onClick={() => { setNotifOpen(v => !v); setProfileOpen(false) }}
                    className="relative flex h-9 w-9 items-center justify-center rounded-full transition-colors"
                    style={{ color: notifOpen ? '#C9A84C' : '#8B9BB4' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#F0F4FF' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = notifOpen ? '#C9A84C' : '#8B9BB4' }}
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span
                        className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold"
                        style={{ background: '#EF4444', color: '#fff' }}
                      >
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  {notifOpen && <NotifDropdown notifications={notifications} onClose={closeNotif} onMarkAllRead={handleMarkAllRead} />}
                </div>

                <div className="relative hidden md:block">
                  <button
                    aria-label="Profile"
                    onClick={() => { setProfileOpen(v => !v); setNotifOpen(false) }}
                    className="overflow-hidden rounded-full transition-all"
                    style={{
                      outline: profileOpen ? '2px solid #C9A84C' : '2px solid transparent',
                      outlineOffset: '2px',
                    }}
                  >
                    <img
                      src={user.avatar}
                      alt={user.fullName}
                      className="rounded-full object-cover"
                      style={{ width: '32px', height: '32px' }}
                    />
                  </button>
                  {profileOpen && <ProfileDropdown onClose={closeProfile} />}
                </div>
              </>
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                <button
                  onClick={() => openAuthModal('login')}
                  className="rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200"
                  style={{ border: '1px solid rgba(240,244,255,0.3)', color: '#F0F4FF', background: 'transparent' }}
                  onMouseEnter={e => {
                    const b = e.currentTarget as HTMLButtonElement
                    b.style.borderColor = '#C9A84C'
                    b.style.color = '#C9A84C'
                  }}
                  onMouseLeave={e => {
                    const b = e.currentTarget as HTMLButtonElement
                    b.style.borderColor = 'rgba(240,244,255,0.3)'
                    b.style.color = '#F0F4FF'
                  }}
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal('register')}
                  className="rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200"
                  style={{ background: '#C9A84C', color: '#0B0F1A' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#E8C76A' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#C9A84C' }}
                >
                  Get Started
                </button>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              aria-label="Open menu"
              className="flex h-9 w-9 items-center justify-center rounded-full transition-colors md:hidden"
              style={{ color: '#8B9BB4' }}
              onClick={() => setDrawerOpen(true)}
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  )
}

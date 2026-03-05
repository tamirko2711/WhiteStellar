import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, MessageCircle, Users, DollarSign, Star, User,
  Settings, HelpCircle, LogOut,
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useAdvisorStore } from '../store/advisorStore'
import { supabase } from '../lib/supabase'
import Toast from '../components/Toast'

// ─── Types ────────────────────────────────────────────────────

interface NavItem {
  icon: React.ElementType
  label: string
  to: string
  end?: boolean
}

// ─── Nav config ───────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  { icon: LayoutDashboard, label: 'Overview',          to: '/advisor/dashboard',              end: true },
  { icon: MessageCircle,   label: 'Sessions',          to: '/advisor/dashboard/sessions'               },
  { icon: Users,           label: 'My Clients',        to: '/advisor/dashboard/clients'                },
  { icon: DollarSign,      label: 'Earnings',          to: '/advisor/dashboard/earnings'               },
  { icon: Star,            label: 'Reviews',           to: '/advisor/dashboard/reviews'                },
  { icon: User,            label: 'My Profile',        to: '/advisor/dashboard/profile'                },
  { icon: Settings,        label: 'Account Settings',  to: '/advisor/dashboard/account'                },
]

const TAB_ITEMS: NavItem[] = [
  { icon: LayoutDashboard, label: 'Overview',  to: '/advisor/dashboard',         end: true },
  { icon: MessageCircle,   label: 'Sessions',  to: '/advisor/dashboard/sessions'           },
  { icon: Users,           label: 'Clients',   to: '/advisor/dashboard/clients'            },
  { icon: DollarSign,      label: 'Earnings',  to: '/advisor/dashboard/earnings'           },
  { icon: User,            label: 'Profile',   to: '/advisor/dashboard/profile'            },
]

// ─── Availability cycling config ──────────────────────────────

const AVAIL_CYCLE: Record<string, 'online' | 'busy' | 'offline'> = {
  online: 'busy', busy: 'offline', offline: 'online',
}

const AVAIL_CONFIG = {
  online:  { color: '#22C55E', bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.3)',  label: 'Available' },
  busy:    { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', label: 'Busy'      },
  offline: { color: '#4B5563', bg: 'rgba(75,85,99,0.12)',   border: 'rgba(75,85,99,0.3)',   label: 'Offline'   },
}

// ─── Sub-components ───────────────────────────────────────────

function SidebarLink({ icon: Icon, label, to, end = false }: NavItem) {
  const { pathname } = useLocation()
  const isActive = end ? pathname === to : pathname.startsWith(to)
  const [hovered, setHovered] = useState(false)

  return (
    <Link
      to={to}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '10px 20px', margin: '2px 8px', borderRadius: '8px',
        fontSize: '13.5px', fontWeight: isActive ? 600 : 400,
        color: isActive ? '#C9A84C' : hovered ? '#F0F4FF' : '#8B9BB4',
        background: isActive
          ? 'rgba(201,168,76,0.1)'
          : hovered ? 'rgba(255,255,255,0.04)' : 'transparent',
        borderLeft: `3px solid ${isActive ? '#C9A84C' : 'transparent'}`,
        textDecoration: 'none', transition: 'all 0.15s',
      }}
    >
      <Icon size={16} />
      {label}
    </Link>
  )
}

function BottomBtn({
  icon: Icon, label, danger = false, onClick,
}: { icon: React.ElementType; label: string; danger?: boolean; onClick?: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '10px 20px', margin: '2px 8px', borderRadius: '8px',
        fontSize: '13px', border: 'none', cursor: 'pointer',
        width: 'calc(100% - 16px)', textAlign: 'left',
        color: hovered ? (danger ? '#EF4444' : '#F0F4FF') : '#8B9BB4',
        background: hovered
          ? (danger ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.04)')
          : 'transparent',
        transition: 'all 0.15s',
      }}
    >
      <Icon size={15} />
      {label}
    </button>
  )
}

function TabLink({ icon: Icon, label, to, end = false }: NavItem) {
  const { pathname } = useLocation()
  const isActive = end ? pathname === to : pathname.startsWith(to)
  return (
    <Link
      to={to}
      style={{
        display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center',
        gap: '3px', padding: '8px 4px',
        color: isActive ? '#C9A84C' : '#8B9BB4',
        textDecoration: 'none', fontSize: '10px', fontWeight: isActive ? 600 : 400,
        transition: 'color 0.15s',
      }}
    >
      <Icon size={20} />
      {label}
    </Link>
  )
}

// ─── Main layout ──────────────────────────────────────────────

export default function AdvisorDashboardLayout() {
  const { user, logout } = useAuthStore()
  const { availability, setAvailability } = useAdvisorStore()
  const navigate = useNavigate()
  const [toast, setToast] = useState({ msg: '', visible: false })

  function showToast(msg: string) {
    setToast({ msg, visible: true })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2500)
  }

  function handleAvailability() {
    const next = AVAIL_CYCLE[availability]
    setAvailability(next)
    if (next === 'online')  showToast('You are now visible to clients ✨')
    if (next === 'offline') showToast('You are now offline.')
    // Persist to Supabase (fire and forget)
    if (user?.id) {
      supabase.from('advisors').update({ status: next }).eq('profile_id', user.id).then(() => {})
    }
  }

  function handleLogout() {
    logout()
    navigate('/')
  }

  const avail = AVAIL_CONFIG[availability]

  return (
    <>
      <div style={{ display: 'flex', background: '#0B0F1A', minHeight: 'calc(100vh - 64px)' }}>

        {/* ── Sidebar (desktop) ── */}
        <aside
          className="hidden md:flex flex-col"
          style={{
            width: '260px', flexShrink: 0,
            position: 'sticky', top: '64px', height: 'calc(100vh - 64px)', overflowY: 'auto',
            background: '#0D1221', borderRight: '1px solid #1E2D45',
          }}
        >
          {/* Advisor identity card */}
          <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #1E2D45' }}>
            <div style={{ position: 'relative', width: '56px', marginBottom: '12px' }}>
              <img
                src={user?.avatar}
                alt={user?.fullName ?? ''}
                style={{ width: '56px', height: '56px', borderRadius: '50%', border: '2px solid #C9A84C' }}
              />
              {/* Status dot */}
              <span style={{
                position: 'absolute', bottom: '2px', right: '2px',
                width: '12px', height: '12px', borderRadius: '50%',
                background: avail.color, border: '2px solid #0D1221',
              }} />
            </div>

            <p style={{ fontWeight: 700, color: '#F0F4FF', fontSize: '15px', margin: '0 0 4px' }}>
              {user?.fullName}
            </p>
            <span style={{
              display: 'inline-block',
              background: 'rgba(201,168,76,0.12)', color: '#C9A84C',
              border: '1px solid rgba(201,168,76,0.3)',
              borderRadius: '20px', padding: '2px 10px', fontSize: '11px', fontWeight: 600,
              marginBottom: '12px',
            }}>
              Advisor
            </span>

            {/* Availability toggle — most important control */}
            <div>
              <p style={{ fontSize: '10px', color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 6px' }}>
                Availability
              </p>
              <button
                onClick={handleAvailability}
                style={{
                  display: 'flex', alignItems: 'center', gap: '7px',
                  background: avail.bg, border: `1px solid ${avail.border}`,
                  color: avail.color, borderRadius: '20px',
                  padding: '6px 14px', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.2s', width: '100%',
                }}
              >
                <span style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: avail.color, flexShrink: 0,
                  boxShadow: availability === 'online' ? `0 0 6px ${avail.color}` : 'none',
                }} />
                {avail.label}
                <span style={{ marginLeft: 'auto', fontSize: '10px', opacity: 0.7 }}>click to change</span>
              </button>
            </div>
          </div>

          {/* Nav items */}
          <nav style={{ flex: 1, padding: '8px 0' }}>
            {NAV_ITEMS.map(item => (
              <SidebarLink key={item.to} {...item} />
            ))}
          </nav>

          {/* Rate mini-display */}
          <div style={{ padding: '12px 20px', borderTop: '1px solid #1E2D45', borderBottom: '1px solid #1E2D45' }}>
            <p style={{ fontSize: '10px', color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>
              Your Rates
            </p>
            {[
              { icon: '💬', label: 'Chat',  price: '$3.99' },
              { icon: '📞', label: 'Audio', price: '$4.99' },
              { icon: '🎥', label: 'Video', price: '$5.99' },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', color: '#8B9BB4' }}>{r.icon} {r.label}</span>
                <span style={{ fontSize: '12px', color: '#C9A84C', fontWeight: 600 }}>{r.price}/min</span>
              </div>
            ))}
          </div>

          {/* Bottom actions */}
          <div style={{ padding: '8px 0 12px' }}>
            <BottomBtn icon={HelpCircle} label="Help & Support" />
            <BottomBtn icon={LogOut} label="Sign Out" danger onClick={handleLogout} />
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, padding: '32px', minWidth: 0, paddingBottom: '88px' }} className="md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* ── Mobile bottom tab bar ── */}
      <div
        className="fixed bottom-0 left-0 right-0 flex md:hidden"
        style={{ background: '#0D1221', borderTop: '1px solid #1E2D45', zIndex: 50 }}
      >
        {TAB_ITEMS.map(tab => (
          <TabLink key={tab.to} {...tab} />
        ))}
      </div>

      <Toast message={toast.msg} visible={toast.visible} />
    </>
  )
}

import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, MessageCircle, Heart, CreditCard, User, Settings,
  HelpCircle, LogOut, Wallet,
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'

// ─── Types ────────────────────────────────────────────────────

interface NavItem {
  icon: React.ElementType
  label: string
  to: string
  end?: boolean
}

// ─── Nav config ───────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  { icon: LayoutDashboard, label: 'Overview',          to: '/dashboard',         end: true },
  { icon: MessageCircle,   label: 'My Sessions',       to: '/dashboard/sessions'            },
  { icon: Heart,           label: 'Saved Advisors',    to: '/dashboard/saved'               },
  { icon: CreditCard,      label: 'Wallet & Payments', to: '/dashboard/wallet'              },
  { icon: User,            label: 'Profile Settings',  to: '/dashboard/profile'             },
  { icon: Settings,        label: 'Account Settings',  to: '/dashboard/account'             },
]

const TAB_ITEMS: NavItem[] = [
  { icon: LayoutDashboard, label: 'Overview', to: '/dashboard',         end: true },
  { icon: MessageCircle,   label: 'Sessions', to: '/dashboard/sessions'           },
  { icon: Heart,           label: 'Saved',    to: '/dashboard/saved'              },
  { icon: CreditCard,      label: 'Wallet',   to: '/dashboard/wallet'             },
  { icon: User,            label: 'Profile',  to: '/dashboard/profile'            },
]

// ─── Sidebar link ─────────────────────────────────────────────

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

// ─── Bottom button ────────────────────────────────────────────

interface BottomBtnProps {
  icon: React.ElementType
  label: string
  danger?: boolean
  onClick?: () => void
}

function BottomBtn({ icon: Icon, label, danger = false, onClick }: BottomBtnProps) {
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

// ─── Mobile tab link ──────────────────────────────────────────

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

export default function ClientDashboardLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <>
      {/* ── Desktop: sidebar + content ── */}
      <div style={{ display: 'flex', background: '#0B0F1A', minHeight: 'calc(100vh - 64px)' }}>

        {/* Sidebar */}
        <aside
          className="hidden md:flex flex-col"
          style={{
            width: '240px',
            flexShrink: 0,
            position: 'sticky',
            top: '64px',
            height: 'calc(100vh - 64px)',
            overflowY: 'auto',
            background: '#0D1221',
            borderRight: '1px solid #1E2D45',
          }}
        >
          {/* User card */}
          <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #1E2D45' }}>
            <img
              src={user?.avatar}
              alt={user?.fullName ?? ''}
              style={{
                width: '56px', height: '56px', borderRadius: '50%',
                border: '2px solid #C9A84C', display: 'block', marginBottom: '12px',
              }}
            />
            <p style={{ fontWeight: 700, color: '#F0F4FF', fontSize: '15px', marginBottom: '8px' }}>
              {user?.fullName}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{
                background: 'rgba(45,212,191,0.12)', color: '#2DD4BF',
                border: '1px solid rgba(45,212,191,0.3)',
                borderRadius: '20px', padding: '2px 10px', fontSize: '11px', fontWeight: 600,
              }}>
                Client
              </span>
              <span style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                color: '#C9A84C', fontSize: '13px', fontWeight: 600,
              }}>
                <Wallet size={13} />
                ${user?.walletBalance.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Nav items */}
          <nav style={{ flex: 1, padding: '8px 0' }}>
            {NAV_ITEMS.map(item => (
              <SidebarLink key={item.to} {...item} />
            ))}
          </nav>

          {/* Bottom actions */}
          <div style={{ borderTop: '1px solid #1E2D45', padding: '8px 0 12px' }}>
            <BottomBtn icon={HelpCircle} label="Help & Support" />
            <BottomBtn icon={LogOut} label="Sign Out" danger onClick={handleLogout} />
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, padding: '32px', minWidth: 0, paddingBottom: '88px' }} className="md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* ── Mobile: bottom tab bar ── */}
      <div
        className="fixed bottom-0 left-0 right-0 flex md:hidden"
        style={{
          background: '#0D1221',
          borderTop: '1px solid #1E2D45',
          zIndex: 50,
        }}
      >
        {TAB_ITEMS.map(tab => (
          <TabLink key={tab.to} {...tab} />
        ))}
      </div>
    </>
  )
}

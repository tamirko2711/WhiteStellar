// ============================================================
// WhiteStellar — Super Admin Layout
// src/layouts/SuperAdminLayout.tsx
// ============================================================

import { useState } from 'react'
import LogoutConfirmModal from '../components/modals/LogoutConfirmModal'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, UserCheck, Tag, MessageSquare,
  DollarSign, Star, Bell, Image, Settings, LogOut, Menu, X,
  Shield,
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'

// ─── Nav config ───────────────────────────────────────────────

interface NavItem { icon: React.ElementType; label: string; to: string; end?: boolean }

const NAV_ITEMS: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard',         to: '/admin',                end: true },
  { icon: Users,           label: 'Advisors',          to: '/admin/advisors'                   },
  { icon: UserCheck,       label: 'Clients',           to: '/admin/clients'                    },
  { icon: Tag,             label: 'Categories',        to: '/admin/categories'                 },
  { icon: MessageSquare,   label: 'Sessions',          to: '/admin/sessions'                   },
  { icon: DollarSign,      label: 'Financials',        to: '/admin/financials'                 },
  { icon: Star,            label: 'Reviews',           to: '/admin/reviews'                    },
  { icon: Bell,            label: 'Notifications',     to: '/admin/notifications'              },
  { icon: Image,           label: 'Hero Banners',      to: '/admin/banners'                    },
  { icon: Settings,        label: 'Platform Settings', to: '/admin/settings'                   },
]

// ─── Sidebar link ─────────────────────────────────────────────

function SidebarLink({ icon: Icon, label, to, end = false, onClick }: NavItem & { onClick?: () => void }) {
  const { pathname } = useLocation()
  const isActive = end ? pathname === to : pathname.startsWith(to)
  const [hov, setHov] = useState(false)

  return (
    <Link
      to={to}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '10px 20px', margin: '2px 8px', borderRadius: '8px',
        fontSize: '13.5px', fontWeight: isActive ? 600 : 400,
        color: isActive ? '#fff' : hov ? '#F0F4FF' : '#8B9BB4',
        background: isActive
          ? 'rgba(239,68,68,0.12)'
          : hov ? 'rgba(255,255,255,0.04)' : 'transparent',
        borderLeft: `3px solid ${isActive ? '#EF4444' : 'transparent'}`,
        textDecoration: 'none', transition: 'all 0.15s',
      }}
    >
      <Icon size={16} />
      {label}
    </Link>
  )
}

// ─── Main layout ──────────────────────────────────────────────

export default function SuperAdminLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  function handleLogout() {
    logout()
    navigate('/')
  }

  const SidebarContent = ({ onNav }: { onNav?: () => void }) => (
    <>
      {/* Logo + badge */}
      <div style={{ padding: '20px', borderBottom: '1px solid #1A2235' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'linear-gradient(135deg,#C9A84C,#E8C96D)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Shield size={18} color="#0B0F1A" />
          </div>
          <span style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '15px' }}>WhiteStellar</span>
          <span style={{
            background: 'rgba(239,68,68,0.15)', color: '#EF4444',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '20px', padding: '2px 8px', fontSize: '10px', fontWeight: 700,
          }}>
            ADMIN
          </span>
        </div>

        {/* Admin identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src={user?.avatar ?? 'https://i.pravatar.cc/150?img=60'}
            alt={user?.fullName ?? 'Admin'}
            style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid rgba(239,68,68,0.5)' }}
          />
          <div>
            <p style={{ color: '#F0F4FF', fontWeight: 600, fontSize: '14px', margin: '0 0 2px' }}>
              {user?.fullName ?? 'Admin User'}
            </p>
            <span style={{
              background: 'rgba(239,68,68,0.1)', color: '#EF4444',
              border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: '20px', padding: '1px 8px', fontSize: '10px', fontWeight: 700,
            }}>
              Super Admin
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
        {NAV_ITEMS.map(item => (
          <SidebarLink key={item.to} {...item} onClick={onNav} />
        ))}
      </nav>

      {/* Sign out */}
      <div style={{ padding: '8px 0 16px', borderTop: '1px solid #1A2235' }}>
        <button
          onClick={() => setShowLogoutConfirm(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 20px', margin: '2px 8px', borderRadius: '8px',
            fontSize: '13px', border: 'none', cursor: 'pointer',
            width: 'calc(100% - 16px)', textAlign: 'left',
            color: '#8B9BB4', background: 'transparent', transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = '#EF4444'
            e.currentTarget.style.background = 'rgba(239,68,68,0.08)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = '#8B9BB4'
            e.currentTarget.style.background = 'transparent'
          }}
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </>
  )

  return (
    <>
      <div style={{ display: 'flex', background: '#080C16', minHeight: '100vh' }}>

        {/* ── Sidebar desktop ── */}
        <aside
          className="hidden lg:flex flex-col"
          style={{
            width: '260px', flexShrink: 0,
            position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
            background: '#080C16', borderRight: '1px solid #1A2235',
          }}
        >
          <SidebarContent />
        </aside>

        {/* ── Mobile header ── */}
        <div
          className="lg:hidden"
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
            background: '#080C16', borderBottom: '1px solid #1A2235',
            padding: '12px 16px', alignItems: 'center', justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={18} color="#EF4444" />
            <span style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '15px' }}>Admin Panel</span>
          </div>
          <button
            onClick={() => setDrawerOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#F0F4FF', padding: '4px' }}
          >
            <Menu size={22} />
          </button>
        </div>

        {/* ── Mobile drawer ── */}
        {drawerOpen && (
          <>
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.6)' }}
              onClick={() => setDrawerOpen(false)}
            />
            <aside style={{
              position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 201,
              width: '280px', background: '#080C16', borderRight: '1px solid #1A2235',
              display: 'flex', flexDirection: 'column', overflowY: 'auto',
            }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px' }}>
                <button onClick={() => setDrawerOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8B9BB4' }}>
                  <X size={20} />
                </button>
              </div>
              <SidebarContent onNav={() => setDrawerOpen(false)} />
            </aside>
          </>
        )}

        {/* Main content */}
        <main
          className="lg:pt-0"
          style={{ flex: 1, padding: '32px', minWidth: 0, paddingTop: '80px' }}
        >
          <div className="lg:pt-0" style={{ paddingTop: '0' }}>
            <Outlet />
          </div>
        </main>
      </div>

      {showLogoutConfirm && (
        <LogoutConfirmModal
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
    </>
  )
}

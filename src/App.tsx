import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import ClientLayout from './layouts/ClientLayout'
import AdvisorLayout from './layouts/AdvisorLayout'
import ClientDashboardLayout from './layouts/ClientDashboardLayout'
import AdvisorDashboardLayout from './layouts/AdvisorDashboardLayout'
import SuperAdminLayout from './layouts/SuperAdminLayout'
import HomePage from './pages/client/HomePage'
import AdvisorProfilePage from './pages/client/AdvisorProfilePage'

// Client dashboard pages
import ClientOverview from './pages/client/dashboard/Overview'
import ClientSessions from './pages/client/dashboard/Sessions'
import SavedAdvisors from './pages/client/dashboard/SavedAdvisors'
import Wallet from './pages/client/dashboard/Wallet'
import ProfileSettings from './pages/client/dashboard/ProfileSettings'
import AccountSettingsPage from './pages/client/dashboard/AccountSettingsPage'

// New public pages
import ZodiacAIPage from './pages/ZodiacAIPage'
import ArticlesPage from './pages/ArticlesPage'
import ArticlePage from './pages/ArticlePage'
import CategoryPage from './pages/CategoryPage'
import AboutPage from './pages/AboutPage'
import FAQPage from './pages/FAQPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import ContactPage from './pages/ContactPage'
import JoinAsAdvisorPage from './pages/JoinAsAdvisorPage'

// Advisor dashboard pages
import AdvisorOverview from './pages/advisor/dashboard/Overview'
import AdvisorSessions from './pages/advisor/dashboard/Sessions'
import AdvisorClients from './pages/advisor/dashboard/Clients'
import AdvisorEarnings from './pages/advisor/dashboard/Earnings'
import AdvisorReviews from './pages/advisor/dashboard/Reviews'
import AdvisorProfile from './pages/advisor/dashboard/Profile'
import AdvisorAccount from './pages/advisor/dashboard/Account'

// Session pages
import ConnectingPage from './pages/session/ConnectingPage'
import ChatSessionPage from './pages/session/ChatSessionPage'
import AudioSessionPage from './pages/session/AudioSessionPage'
import VideoSessionPage from './pages/session/VideoSessionPage'
import SessionEndPage from './pages/session/SessionEndPage'
import LiveChatPage from './pages/session/LiveChatPage'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminAdvisors from './pages/admin/Advisors'
import AdminAdvisorDetail from './pages/admin/AdvisorDetail'
import AdminClients from './pages/admin/Clients'
import AdminCategories from './pages/admin/Categories'
import AdminSessions from './pages/admin/Sessions'
import AdminFinancials from './pages/admin/Financials'
import AdminReviews from './pages/admin/Reviews'
import AdminNotifications from './pages/admin/Notifications'
import AdminBanners from './pages/admin/Banners'
import AdminSettings from './pages/admin/Settings'

import AdvisorDashboard from './pages/AdvisorDashboard'
import AuthModal from './components/modals/AuthModal'
import ProtectedRoute from './components/ProtectedRoute'
import { ScrollToTop } from './components/ScrollToTop'
import { useAuthStore } from './store/authStore'
import { useNavigate } from 'react-router-dom'
import { ComingSoonPage } from './pages/ComingSoonPage'

// ─── Dev toggle ───────────────────────────────────────────────

function DevToggle() {
  const { userType } = useAuthStore()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  function switchTo(type: 'client' | 'advisor' | 'superadmin') {
    const users = {
      client: {
        id: 'dev-client-001', fullName: 'Sarah Mitchell',
        avatar: 'https://i.pravatar.cc/150?img=5', walletBalance: 45.00, email: 'sarah@demo.com',
      },
      advisor: {
        id: 'dev-advisor-001', fullName: 'Luna Starweaver',
        avatar: 'https://i.pravatar.cc/150?img=47', walletBalance: 0, email: 'luna@demo.com',
      },
      superadmin: {
        id: 'dev-admin-001', fullName: 'Admin User',
        avatar: 'https://i.pravatar.cc/150?img=60', walletBalance: 0, email: 'admin@demo.com',
      },
    }
    useAuthStore.setState({ isLoggedIn: true, userType: type, user: users[type], isLoading: false })
    navigate(type === 'client' ? '/dashboard' : type === 'advisor' ? '/advisor/dashboard' : '/admin')
  }

  function logout() {
    useAuthStore.setState({ isLoggedIn: false, userType: null, user: null })
    navigate('/')
  }

  const btn = (label: string, type: 'client' | 'advisor' | 'superadmin') => {
    const active = userType === type
    const color = type === 'superadmin' ? '#EF4444' : '#C9A84C'
    return (
      <button
        key={type}
        onClick={() => switchTo(type)}
        style={{
          background: active ? color : '#1A2540',
          border: `1px solid ${active ? color : '#1E2D45'}`,
          color: active ? (type === 'superadmin' ? '#fff' : '#0B0F1A') : '#8B9BB4',
          borderRadius: '8px', padding: '7px 14px',
          fontSize: '12px', fontWeight: 600, cursor: 'pointer',
        }}
      >
        {label}
      </button>
    )
  }

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        title="Show Dev Mode"
        style={{
          position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000,
          background: 'rgba(11,15,26,0.9)', border: '1px solid #1E2D45',
          borderRadius: '8px', padding: '6px 10px',
          fontSize: '10px', color: '#4B5563', fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer',
        }}
      >
        DEV
      </button>
    )
  }

  return (
    <div style={{
      position: 'fixed', bottom: '20px', right: '20px',
      display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 1000,
    }}>
      <div style={{
        background: 'rgba(11,15,26,0.9)', border: '1px solid #1E2D45',
        borderRadius: '10px', padding: '6px 10px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px',
      }}>
        <span style={{ fontSize: '10px', color: '#4B5563', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          DEV MODE
        </span>
        <button
          onClick={() => setCollapsed(true)}
          title="Hide Dev Mode"
          style={{
            background: 'none', border: 'none', color: '#4B5563',
            cursor: 'pointer', fontSize: '12px', lineHeight: 1, padding: '0 2px',
          }}
        >
          ✕
        </button>
      </div>
      {btn('→ Admin View', 'superadmin')}
      {btn('→ Client View', 'client')}
      {btn('→ Advisor View', 'advisor')}
      {userType && (
        <button
          onClick={logout}
          style={{
            background: 'transparent', border: '1px solid #1E2D45',
            color: '#4B5563', borderRadius: '8px', padding: '7px 14px',
            fontSize: '12px', fontWeight: 600, cursor: 'pointer',
          }}
        >
          ✕ Log out
        </button>
      )}
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────

export default function App() {
  const { initialize } = useAuthStore()
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return localStorage.getItem('ws_access_granted') === 'true'
  })

  useEffect(() => {
    initialize()
  }, [initialize])

  function handleUnlock() {
    localStorage.setItem('ws_access_granted', 'true')
    setIsUnlocked(true)
  }

  if (!isUnlocked) {
    return <ComingSoonPage onUnlock={handleUnlock} />
  }

  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthModal />

      <Routes>
        {/* ── Client portal + Advisor dashboard (share Navbar via ClientLayout) ── */}
        <Route element={<ClientLayout />}>
          <Route index element={<HomePage />} />
          <Route path="advisor/:id"        element={<AdvisorProfilePage />} />
          <Route path="zodiac-ai"          element={<ZodiacAIPage />} />
          <Route path="articles"           element={<ArticlesPage />} />
          <Route path="articles/:slug"     element={<ArticlePage />} />
          <Route path="category/:slug"     element={<CategoryPage />} />
          <Route path="about"              element={<AboutPage />} />
          <Route path="faq"               element={<FAQPage />} />
          <Route path="privacy"           element={<PrivacyPolicyPage />} />
          <Route path="contact"           element={<ContactPage />} />
          <Route path="join-as-psychic"   element={<JoinAsAdvisorPage />} />

          {/* ── Client dashboard ── */}
          <Route
            path="dashboard"
            element={
              <ProtectedRoute allowedTypes={['client']}>
                <ClientDashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index           element={<ClientOverview />}   />
            <Route path="sessions" element={<ClientSessions />}   />
            <Route path="saved"    element={<SavedAdvisors />}    />
            <Route path="wallet"   element={<Wallet />}           />
            <Route path="profile"  element={<ProfileSettings />}  />
            <Route path="account"  element={<AccountSettingsPage />} />
          </Route>

          {/* ── Advisor dashboard ── */}
          <Route
            path="advisor/dashboard"
            element={
              <ProtectedRoute allowedTypes={['advisor']}>
                <AdvisorDashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index             element={<AdvisorOverview />}  />
            <Route path="sessions"   element={<AdvisorSessions />}  />
            <Route path="clients"    element={<AdvisorClients />}   />
            <Route path="earnings"   element={<AdvisorEarnings />}  />
            <Route path="reviews"    element={<AdvisorReviews />}   />
            <Route path="profile"    element={<AdvisorProfile />}   />
            <Route path="account"    element={<AdvisorAccount />}   />
          </Route>
        </Route>

        {/* ── Advisor internal dashboard (legacy) ── */}
        <Route path="/advisor-dashboard" element={<AdvisorLayout />}>
          <Route index element={<AdvisorDashboard />} />
        </Route>

        {/* ── Session routes (fullscreen, no layout wrapper) ── */}
        <Route path="/session/connecting"   element={<ConnectingPage />} />
        <Route path="/session/chat"         element={<ChatSessionPage />} />
        <Route path="/session/audio"        element={<AudioSessionPage />} />
        <Route path="/session/video"        element={<VideoSessionPage />} />
        <Route path="/session/end"          element={<SessionEndPage />} />
        <Route path="/session/live/:sessionId" element={<LiveChatPage />} />

        {/* ── Super Admin panel ── */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedTypes={['superadmin']}>
              <SuperAdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index                element={<AdminDashboard />}     />
          <Route path="advisors"      element={<AdminAdvisors />}      />
          <Route path="advisors/:id"  element={<AdminAdvisorDetail />} />
          <Route path="clients"       element={<AdminClients />}       />
          <Route path="categories"    element={<AdminCategories />}    />
          <Route path="sessions"      element={<AdminSessions />}      />
          <Route path="financials"    element={<AdminFinancials />}    />
          <Route path="reviews"       element={<AdminReviews />}       />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="banners"       element={<AdminBanners />}       />
          <Route path="settings"      element={<AdminSettings />}      />
        </Route>

        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <DevToggle />
    </BrowserRouter>
  )
}

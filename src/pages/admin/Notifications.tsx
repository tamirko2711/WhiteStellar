// ============================================================
// WhiteStellar — Super Admin: Notifications
// src/pages/admin/Notifications.tsx
// ============================================================

import { Bell, MessageCircle, Star, DollarSign, AlertTriangle } from 'lucide-react'
import { NOTIFICATIONS } from '../../data/advisors'
import { format } from 'date-fns'

const ICON_MAP: Record<string, React.ReactNode> = {
  advisor_online:    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22C55E' }} />,
  new_review:        <Star size={14} color="#C9A84C" />,
  session_started:   <MessageCircle size={14} color="#3B82F6" />,
  session_cancelled: <AlertTriangle size={14} color="#F59E0B" />,
  payout_processed:  <DollarSign size={14} color="#22C55E" />,
}

const COLOR_MAP: Record<string, string> = {
  advisor_online: '#22C55E',
  new_review: '#C9A84C',
  session_started: '#3B82F6',
  session_cancelled: '#F59E0B',
  payout_processed: '#22C55E',
}

export default function AdminNotifications() {
  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '22px', margin: '0 0 4px' }}>
          Notifications
        </h1>
        <p style={{ color: '#8B9BB4', fontSize: '14px', margin: 0 }}>
          System and platform event notifications.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {NOTIFICATIONS.map(n => {
          const icon = ICON_MAP[n.type] ?? <Bell size={14} color="#8B9BB4" />
          const borderColor = COLOR_MAP[n.type] ?? '#1A2235'
          return (
            <div key={n.id} style={{
              background: n.isRead ? '#0D1221' : '#111927',
              border: '1px solid #1A2235',
              borderLeft: `3px solid ${n.isRead ? '#1A2235' : borderColor}`,
              borderRadius: '12px', padding: '14px 18px',
              display: 'flex', alignItems: 'flex-start', gap: '12px',
            }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                background: '#1A2540', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {icon}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: '#F0F4FF', fontWeight: n.isRead ? 400 : 600, fontSize: '14px', margin: '0 0 2px' }}>
                  {n.title}
                </p>
                <p style={{ color: '#8B9BB4', fontSize: '13px', margin: '0 0 4px', lineHeight: 1.5 }}>
                  {n.message}
                </p>
                <span style={{ color: '#4B5563', fontSize: '11px' }}>
                  {format(new Date(n.createdAt), 'MMM d, yyyy HH:mm')}
                </span>
              </div>
              {!n.isRead && (
                <span style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: borderColor, flexShrink: 0, marginTop: '4px',
                }} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

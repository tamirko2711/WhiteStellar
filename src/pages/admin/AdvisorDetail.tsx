// ============================================================
// WhiteStellar — Super Admin: Advisor Detail
// src/pages/admin/AdvisorDetail.tsx
// ============================================================

import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Star, Check, X, Shield, Edit2 } from 'lucide-react'
import { format } from 'date-fns'
import { getAdvisorById, getSessionsByAdvisor, type AccountStatus } from '../../data/advisors'
import Toast from '../../components/Toast'

// ─── Status badge ─────────────────────────────────────────────

function StatusBadge({ status }: { status: AccountStatus }) {
  const MAP = {
    active:   { bg: 'rgba(34,197,94,0.1)',  color: '#22C55E', label: 'Active'   },
    pending:  { bg: 'rgba(245,158,11,0.1)', color: '#F59E0B', label: 'Pending'  },
    frozen:   { bg: 'rgba(59,130,246,0.1)', color: '#3B82F6', label: 'Frozen'   },
    inactive: { bg: 'rgba(75,85,99,0.1)',   color: '#6B7280', label: 'Inactive' },
  }
  const c = MAP[status] ?? MAP.inactive
  return (
    <span style={{
      background: c.bg, color: c.color,
      borderRadius: '20px', padding: '4px 14px', fontSize: '13px', fontWeight: 700,
    }}>
      {c.label}
    </span>
  )
}

// ─── Toggle ───────────────────────────────────────────────────

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div onClick={() => onChange(!on)} style={{
      width: '40px', height: '22px', borderRadius: '11px', cursor: 'pointer',
      background: on ? '#C9A84C' : '#1A2235', position: 'relative', transition: 'background 0.2s',
    }}>
      <div style={{
        position: 'absolute', top: '3px', left: on ? '21px' : '3px',
        width: '16px', height: '16px', borderRadius: '50%',
        background: '#fff', transition: 'left 0.2s',
      }} />
    </div>
  )
}

// ─── Approve/Reject modals ────────────────────────────────────

function ApproveModal({ name, onConfirm, onClose }: { name: string; onConfirm: (sendEmail: boolean) => void; onClose: () => void }) {
  const [sendEmail, setSendEmail] = useState(true)
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}>
      <div style={{ background: '#0D1221', border: '1px solid #1A2235', borderRadius: '16px', padding: '28px', maxWidth: '420px', width: '100%' }}>
        <h3 style={{ color: '#F0F4FF', fontWeight: 700, margin: '0 0 8px' }}>Approve {name}?</h3>
        <p style={{ color: '#8B9BB4', fontSize: '14px', margin: '0 0 16px' }}>
          This will activate their advisor account and make them visible to clients.
        </p>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '20px' }}>
          <Toggle on={sendEmail} onChange={setSendEmail} />
          <span style={{ color: '#F0F4FF', fontSize: '14px' }}>Send welcome email to advisor</span>
        </label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #1A2235', background: '#1A2540', color: '#8B9BB4', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
          <button onClick={() => onConfirm(sendEmail)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: '#22C55E', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}>Approve Account</button>
        </div>
      </div>
    </div>
  )
}

function RejectModal({ name, onConfirm, onClose }: { name: string; onConfirm: (reason: string) => void; onClose: () => void }) {
  const [reason, setReason] = useState('')
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}>
      <div style={{ background: '#0D1221', border: '1px solid #1A2235', borderRadius: '16px', padding: '28px', maxWidth: '440px', width: '100%' }}>
        <h3 style={{ color: '#EF4444', fontWeight: 700, margin: '0 0 8px' }}>Reject {name}?</h3>
        <p style={{ color: '#8B9BB4', fontSize: '14px', margin: '0 0 12px' }}>Provide a reason (will be emailed to the advisor):</p>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          rows={4}
          placeholder="e.g. Your application does not meet our minimum experience requirements…"
          style={{
            width: '100%', background: '#1A2540', border: '1px solid #1A2235',
            borderRadius: '10px', padding: '10px', color: '#F0F4FF', fontSize: '14px',
            resize: 'vertical', outline: 'none', boxSizing: 'border-box', marginBottom: '16px',
          }}
        />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #1A2235', background: '#1A2540', color: '#8B9BB4', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
          <button onClick={() => onConfirm(reason)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: '#EF4444', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}>Reject Account</button>
        </div>
      </div>
    </div>
  )
}

// ─── InfoRow ──────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', borderBottom: '1px solid #1A2235', padding: '10px 0' }}>
      <span style={{ color: '#4B5563', fontSize: '13px', width: '160px', flexShrink: 0 }}>{label}</span>
      <span style={{ color: '#F0F4FF', fontSize: '13px' }}>{value}</span>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────

export default function AdminAdvisorDetail() {
  const { id } = useParams<{ id: string }>()
  const advisor = getAdvisorById(Number(id))

  const [status, setStatus] = useState<AccountStatus>(advisor?.accountStatus ?? 'active')
  const [isTop, setIsTop] = useState(advisor?.isTopAdvisor ?? false)
  const [adminNote, setAdminNote] = useState('')
  const [noteSaved, setNoteSaved] = useState(false)
  const [showApprove, setShowApprove] = useState(false)
  const [showReject, setShowReject] = useState(false)
  const [toast, setToast] = useState({ msg: '', visible: false })

  function showToast(msg: string) {
    setToast({ msg, visible: true })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2500)
  }

  if (!advisor) {
    return (
      <div style={{ textAlign: 'center', padding: '80px', color: '#4B5563' }}>
        <p>Advisor not found.</p>
        <Link to="/admin/advisors" style={{ color: '#C9A84C' }}>← Back to Advisors</Link>
      </div>
    )
  }

  const sessions = getSessionsByAdvisor(advisor.id)

  return (
    <div>
      {/* Back nav */}
      <Link to="/admin/advisors" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#8B9BB4', fontSize: '13px', textDecoration: 'none', marginBottom: '20px' }}>
        <ArrowLeft size={14} /> Back to Advisors
      </Link>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* ── Left 70% ── */}
        <div style={{ flex: '1 1 480px', minWidth: 0 }}>

          {/* Profile header card */}
          <div style={{ background: '#0D1221', border: '1px solid #1A2235', borderRadius: '16px', overflow: 'hidden', marginBottom: '20px' }}>
            <div style={{ position: 'relative', height: '130px' }}>
              <img src={advisor.backgroundImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />
            </div>
            <div style={{ padding: '0 20px 20px', position: 'relative' }}>
              <img src={advisor.avatar} alt={advisor.fullName} style={{
                width: '64px', height: '64px', borderRadius: '50%',
                border: '3px solid #C9A84C', objectFit: 'cover',
                marginTop: '-32px', position: 'relative',
              }} />
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h2 style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '20px', margin: '0 0 4px' }}>{advisor.fullName}</h2>
                  <p style={{ color: '#8B9BB4', fontSize: '13px', margin: '0 0 8px' }}>{advisor.shortBio}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <StatusBadge status={status} />
                    {isTop && (
                      <span style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '20px', padding: '2px 10px', fontSize: '11px', fontWeight: 700 }}>
                        Top Advisor
                      </span>
                    )}
                    {status === 'pending' && (
                      <span style={{ color: '#4B5563', fontSize: '12px' }}>Submitted for review on {advisor.joinedAt}</span>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', marginBottom: '4px' }}>
                    <Star size={14} fill="#C9A84C" color="#C9A84C" />
                    <span style={{ color: '#C9A84C', fontWeight: 700 }}>{advisor.rating}</span>
                    <span style={{ color: '#4B5563', fontSize: '12px' }}>({advisor.reviewCount.toLocaleString()} reviews)</span>
                  </div>
                  <p style={{ color: '#8B9BB4', fontSize: '12px', margin: 0 }}>{advisor.totalSessions.toLocaleString()} sessions</p>
                </div>
              </div>
            </div>
          </div>

          {/* Profile details */}
          <div style={{ background: '#0D1221', border: '1px solid #1A2235', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
            <h3 style={{ color: '#F0F4FF', fontWeight: 600, margin: '0 0 16px', fontSize: '15px' }}>Profile Details</h3>
            <InfoRow label="Full Bio" value={advisor.longBio.slice(0, 120) + '…'} />
            <InfoRow label="Years Active" value={`${advisor.yearsActive} years`} />
            <InfoRow label="Response Time" value={advisor.responseTime} />
            <InfoRow label="Session Types" value={advisor.sessionTypes.join(', ')} />
            <InfoRow label="Pricing" value={[
              advisor.pricing.chat ? `Chat $${advisor.pricing.chat}/min` : null,
              advisor.pricing.audio ? `Audio $${advisor.pricing.audio}/min` : null,
              advisor.pricing.video ? `Video $${advisor.pricing.video}/min` : null,
            ].filter(Boolean).join(' · ')} />
            <InfoRow label="Categories" value={advisor.categories.map(c => c.title).join(', ')} />
            <InfoRow label="Specializations" value={advisor.specializations.map(s => s.title).join(', ')} />
            <InfoRow label="Languages" value={advisor.languages.map(l => l.name).join(', ')} />
            <InfoRow label="Withdrawal Method" value={advisor.withdrawalMethod} />
            <InfoRow label="Joined" value={advisor.joinedAt} />
          </div>

          {/* Sessions */}
          <div style={{ background: '#0D1221', border: '1px solid #1A2235', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
            <h3 style={{ color: '#F0F4FF', fontWeight: 600, margin: '0 0 16px', fontSize: '15px' }}>
              Sessions ({sessions.length})
            </h3>
            {sessions.length === 0 ? (
              <p style={{ color: '#4B5563', fontSize: '13px' }}>No sessions yet.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1A2235' }}>
                    {['Client', 'Type', 'Duration', 'Cost', 'Status', 'Date'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '8px', color: '#4B5563', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sessions.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #1A2235' }}>
                      <td style={{ padding: '10px 8px', color: '#F0F4FF' }}>{s.clientName}</td>
                      <td style={{ padding: '10px 8px', color: '#8B9BB4' }}>{s.type}</td>
                      <td style={{ padding: '10px 8px', color: '#8B9BB4' }}>{s.durationMinutes} min</td>
                      <td style={{ padding: '10px 8px', color: '#C9A84C', fontWeight: 600 }}>${s.totalCost.toFixed(2)}</td>
                      <td style={{ padding: '10px 8px' }}>
                        <span style={{
                          background: s.status === 'completed' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                          color: s.status === 'completed' ? '#22C55E' : '#EF4444',
                          borderRadius: '20px', padding: '2px 8px', fontSize: '11px', fontWeight: 600,
                        }}>{s.status}</span>
                      </td>
                      <td style={{ padding: '10px 8px', color: '#4B5563', fontSize: '12px' }}>
                        {format(new Date(s.startedAt), 'MMM d, yyyy')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Reviews */}
          <div style={{ background: '#0D1221', border: '1px solid #1A2235', borderRadius: '16px', padding: '20px' }}>
            <h3 style={{ color: '#F0F4FF', fontWeight: 600, margin: '0 0 16px', fontSize: '15px' }}>Reviews</h3>
            {advisor.reviews.length === 0 ? (
              <p style={{ color: '#4B5563', fontSize: '13px' }}>No reviews yet.</p>
            ) : (
              advisor.reviews.map(r => (
                <div key={r.id} style={{ borderBottom: '1px solid #1A2235', paddingBottom: '12px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <img src={r.clientAvatar} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
                    <span style={{ color: '#F0F4FF', fontWeight: 600, fontSize: '13px' }}>{r.clientName}</span>
                    <div style={{ display: 'flex' }}>
                      {[1,2,3,4,5].map(i => <Star key={i} size={11} fill={i <= r.rating ? '#C9A84C' : 'transparent'} color={i <= r.rating ? '#C9A84C' : '#4B5563'} />)}
                    </div>
                    <span style={{ color: '#4B5563', fontSize: '11px' }}>{format(new Date(r.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                  <p style={{ color: '#8B9BB4', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>"{r.comment}"</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Right 30% — Admin controls ── */}
        <div style={{ width: '280px', flexShrink: 0 }}>
          <div style={{
            background: '#0D1221', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '16px', padding: '20px', position: 'sticky', top: '20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Shield size={16} color="#EF4444" />
              <h3 style={{ color: '#EF4444', fontWeight: 700, margin: 0, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Admin Controls
              </h3>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <p style={{ color: '#4B5563', fontSize: '11px', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Current Status</p>
              <StatusBadge status={status} />
            </div>

            {/* Action buttons based on status */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {status === 'pending' && (
                <>
                  <button onClick={() => setShowApprove(true)} style={{
                    background: '#22C55E', border: 'none', color: '#fff', fontWeight: 700,
                    padding: '10px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  }}>
                    <Check size={15} /> Approve Account
                  </button>
                  <button onClick={() => setShowReject(true)} style={{
                    background: '#EF4444', border: 'none', color: '#fff', fontWeight: 700,
                    padding: '10px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  }}>
                    <X size={15} /> Reject Account
                  </button>
                </>
              )}
              {status === 'active' && (
                <button onClick={() => { setStatus('frozen'); showToast('Account frozen.') }} style={{
                  background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
                  color: '#F59E0B', fontWeight: 700, padding: '10px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px',
                }}>
                  Freeze Account
                </button>
              )}
              {(status === 'frozen' || status === 'inactive') && (
                <button onClick={() => { setStatus('active'); showToast('Account reactivated ✓') }} style={{
                  background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
                  color: '#22C55E', fontWeight: 700, padding: '10px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px',
                }}>
                  Reactivate Account
                </button>
              )}
              <button style={{
                background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)',
                color: '#C9A84C', fontWeight: 700, padding: '10px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              }}>
                <Edit2 size={14} /> Edit Advisor Profile
              </button>
            </div>

            {/* Top Advisor toggle */}
            <div style={{ background: '#080C16', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#F0F4FF', fontSize: '13px', fontWeight: 600 }}>Feature as Top Advisor</span>
                <Toggle on={isTop} onChange={v => { setIsTop(v); showToast(v ? 'Added to Top Advisors list ✓' : 'Removed from Top Advisors.') }} />
              </div>
              <p style={{ color: '#4B5563', fontSize: '11px', margin: 0 }}>Shown in homepage Top Advisors section</p>
            </div>

            {/* Admin notes */}
            <div>
              <p style={{ color: '#4B5563', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>
                Internal Notes
              </p>
              <textarea
                value={adminNote}
                onChange={e => setAdminNote(e.target.value)}
                rows={4}
                placeholder="Notes not visible to advisor…"
                style={{
                  width: '100%', background: '#080C16', border: '1px solid #1A2235',
                  borderRadius: '8px', padding: '10px', color: '#F0F4FF', fontSize: '13px',
                  resize: 'vertical', outline: 'none', boxSizing: 'border-box',
                }}
              />
              <button
                onClick={() => { setNoteSaved(true); showToast('Notes saved ✓'); setTimeout(() => setNoteSaved(false), 2000) }}
                style={{
                  marginTop: '8px', padding: '7px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                  background: noteSaved ? '#22C55E' : 'rgba(201,168,76,0.1)',
                  border: `1px solid ${noteSaved ? '#22C55E' : 'rgba(201,168,76,0.3)'}`,
                  color: noteSaved ? '#fff' : '#C9A84C', cursor: 'pointer',
                }}
              >
                {noteSaved ? 'Saved!' : 'Save Notes'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showApprove && (
        <ApproveModal
          name={advisor.fullName}
          onConfirm={(sendEmail) => {
            setStatus('active')
            setShowApprove(false)
            showToast(sendEmail ? 'Account approved. Welcome email sent. ✓' : 'Account approved ✓')
          }}
          onClose={() => setShowApprove(false)}
        />
      )}
      {showReject && (
        <RejectModal
          name={advisor.fullName}
          onConfirm={() => {
            setStatus('inactive')
            setShowReject(false)
            showToast('Account rejected. Advisor notified.')
          }}
          onClose={() => setShowReject(false)}
        />
      )}

      <Toast message={toast.msg} visible={toast.visible} />
    </div>
  )
}

import { useState, useEffect } from 'react'
import { CreditCard, ArrowUpCircle, ArrowDownCircle, RefreshCw, Download, Lock } from 'lucide-react'
import { format } from 'date-fns'
import { useAuthStore } from '../../../store/authStore'
import { addToWallet, getTransactions } from '../../../lib/api/wallet'
import Toast from '../../../components/Toast'

const PRESET_AMOUNTS = [10, 25, 50, 100, 200]

type PayMethod = 'card' | 'paypal' | 'apple'
type TxFilter  = 'all' | 'deposit' | 'session_charge' | 'refund'

const TX_FILTER_PILLS: { key: TxFilter; label: string }[] = [
  { key: 'all',            label: 'All'             },
  { key: 'deposit',        label: 'Deposits'        },
  { key: 'session_charge', label: 'Session Charges' },
  { key: 'refund',         label: 'Refunds'         },
]

// ─── Helpers ──────────────────────────────────────────────────

function txIcon(type: string) {
  if (type === 'deposit') return <ArrowUpCircle size={18} style={{ color: '#22C55E' }} />
  if (type === 'refund')  return <RefreshCw size={18}      style={{ color: '#3B82F6' }} />
  return                         <ArrowDownCircle size={18} style={{ color: '#EF4444' }} />
}

// ─── Wallet page ──────────────────────────────────────────────

interface Transaction {
  id: string
  type: string
  amount: number
  balance_after: number
  created_at: string
  description: string
}

export default function Wallet() {
  const { user, updateWalletBalance } = useAuthStore()

  const [selectedPreset, setSelectedPreset] = useState<number | null>(50)
  const [customInput, setCustomInput] = useState('')
  const [payMethod, setPayMethod] = useState<PayMethod>('card')
  const [addLoading, setAddLoading] = useState(false)
  const [txFilter, setTxFilter] = useState<TxFilter>('all')
  const [toast, setToast] = useState({ msg: '', visible: false })
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    if (!user?.id) return
    getTransactions(user.id)
      .then(setTransactions)
      .catch(console.error)
  }, [user?.id])

  function showToast(msg: string) {
    setToast({ msg, visible: true })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2800)
  }

  const effectiveAmount = customInput ? parseFloat(customInput) || 0 : selectedPreset ?? 0

  async function handleAddFunds() {
    if (effectiveAmount <= 0 || !user?.id) return
    setAddLoading(true)
    try {
      const newBalance = await addToWallet(
        user.id,
        effectiveAmount,
        `Wallet top-up via ${payMethod === 'card' ? 'Credit Card' : payMethod === 'paypal' ? 'PayPal' : 'Apple Pay'}`,
      )
      updateWalletBalance(newBalance)
      // Refresh transactions
      const txs = await getTransactions(user.id)
      setTransactions(txs)
      showToast(`💰 $${effectiveAmount.toFixed(2)} added to your wallet!`)
      setCustomInput('')
      setSelectedPreset(50)
    } catch (err) {
      showToast('Failed to add funds. Please try again.')
      console.error(err)
    } finally {
      setAddLoading(false)
    }
  }

  const filteredTx = transactions.filter(t =>
    txFilter === 'all' ? true : t.type === txFilter
  )

  // ── Payment method cards
  const PAY_METHODS: { key: PayMethod; label: string; sub?: string; icon: React.ReactNode }[] = [
    {
      key: 'card', label: 'Credit / Debit Card',
      sub: 'Visa ending in 4242',
      icon: <CreditCard size={20} style={{ color: '#2DD4BF' }} />,
    },
    {
      key: 'paypal', label: 'PayPal',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M7.07 21.19L7.6 17.97H6.27L7 13.5h1.54c2.9 0 5.07-1.37 5.73-4.26.28-1.2.1-2.18-.48-2.86-.64-.76-1.77-1.13-3.28-1.13H6.41L4 21.19H7.07Z" fill="#003087"/>
          <path d="M18.5 8.5c-.3 1.9-1.5 3.3-3.3 3.9-.7.3-1.5.4-2.4.4H11l-.8 5H7l2.5-14h5.2c1.7 0 3 .4 3.7 1.1.8.7 1 1.7.8 3.1l-.7.5Z" fill="#009cde"/>
        </svg>
      ),
    },
    {
      key: 'apple', label: 'Apple Pay',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#F0F4FF" aria-hidden>
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.14-2.15 1.25-2.13 3.74.03 2.97 2.6 3.96 2.63 3.97-.03.07-.41 1.4-1.35 2.9Z"/>
          <path d="M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11Z"/>
        </svg>
      ),
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* ── Page heading ── */}
      <div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', fontWeight: 700, color: '#F0F4FF', margin: '0 0 4px' }}>
          Wallet & Payments
        </h1>
        <p style={{ color: '#8B9BB4', fontSize: '14px', margin: 0 }}>
          Manage your balance and payment history
        </p>
      </div>

      {/* ── Balance hero card ── */}
      <div style={{
        background: 'radial-gradient(ellipse at 20% 50%, rgba(201,168,76,0.1) 0%, #0D1221 60%)',
        border: '1px solid rgba(201,168,76,0.3)', borderRadius: '20px',
        padding: '32px 36px',
      }}>
        <p style={{ color: '#8B9BB4', fontSize: '12px', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Available Balance
        </p>
        <p style={{ fontSize: '48px', fontWeight: 700, color: '#C9A84C', margin: '0 0 24px', lineHeight: 1 }}>
          ${user?.walletBalance.toFixed(2)}
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => document.getElementById('add-funds')?.scrollIntoView({ behavior: 'smooth' })}
            style={{
              background: '#C9A84C', color: '#0B0F1A', borderRadius: '10px',
              padding: '10px 22px', fontWeight: 700, fontSize: '14px',
              border: 'none', cursor: 'pointer',
            }}
          >
            Add Funds
          </button>
          <button
            onClick={() => document.getElementById('tx-history')?.scrollIntoView({ behavior: 'smooth' })}
            style={{
              background: 'transparent', color: '#F0F4FF', borderRadius: '10px',
              padding: '10px 22px', fontWeight: 600, fontSize: '14px',
              border: '1px solid rgba(240,244,255,0.2)', cursor: 'pointer',
            }}
          >
            Payment History
          </button>
        </div>
      </div>

      {/* ── Add funds ── */}
      <section id="add-funds" style={{ background: '#0D1221', border: '1px solid #1E2D45', borderRadius: '16px', padding: '28px' }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 700, color: '#F0F4FF', margin: '0 0 20px' }}>
          Top Up Your Wallet
        </h2>

        {/* Preset amounts */}
        <p style={{ fontSize: '12px', color: '#8B9BB4', margin: '0 0 10px' }}>Select amount</p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {PRESET_AMOUNTS.map(amt => (
            <button
              key={amt}
              onClick={() => { setSelectedPreset(amt); setCustomInput('') }}
              style={{
                padding: '8px 20px', borderRadius: '20px', fontSize: '14px', fontWeight: 600,
                border: `1px solid ${selectedPreset === amt && !customInput ? '#C9A84C' : '#1E2D45'}`,
                background: selectedPreset === amt && !customInput ? 'rgba(201,168,76,0.1)' : 'transparent',
                color: selectedPreset === amt && !customInput ? '#C9A84C' : '#8B9BB4',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              ${amt}
            </button>
          ))}
        </div>

        {/* Custom amount */}
        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '12px', color: '#8B9BB4', margin: '0 0 8px' }}>Or enter custom amount</p>
          <div style={{ position: 'relative', maxWidth: '200px' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8B9BB4', fontSize: '14px' }}>$</span>
            <input
              type="number"
              min="1"
              placeholder="0.00"
              value={customInput}
              onChange={e => { setCustomInput(e.target.value); setSelectedPreset(null) }}
              style={{
                width: '100%', background: '#131929', border: '1px solid #1E2D45',
                borderRadius: '10px', padding: '10px 12px 10px 24px',
                color: '#F0F4FF', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* Payment methods */}
        <p style={{ fontSize: '12px', color: '#8B9BB4', margin: '0 0 12px' }}>Payment method</p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {PAY_METHODS.map(pm => (
            <button
              key={pm.key}
              onClick={() => setPayMethod(pm.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '12px 16px', borderRadius: '12px', cursor: 'pointer',
                border: `1px solid ${payMethod === pm.key ? '#C9A84C' : '#1E2D45'}`,
                background: payMethod === pm.key ? 'rgba(201,168,76,0.07)' : '#131929',
                color: '#F0F4FF', fontSize: '13px', fontWeight: 500,
                minWidth: '140px', transition: 'all 0.15s',
              }}
            >
              {pm.icon}
              <div style={{ textAlign: 'left' }}>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>{pm.label}</p>
                {pm.sub && <p style={{ margin: 0, fontSize: '11px', color: '#8B9BB4' }}>{pm.sub}</p>}
              </div>
            </button>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={handleAddFunds}
          disabled={effectiveAmount <= 0 || addLoading}
          style={{
            width: '100%', height: '50px', borderRadius: '12px', border: 'none',
            background: effectiveAmount > 0 && !addLoading ? '#C9A84C' : '#1E2D45',
            color: effectiveAmount > 0 && !addLoading ? '#0B0F1A' : '#4B5563',
            fontSize: '15px', fontWeight: 700,
            cursor: effectiveAmount > 0 && !addLoading ? 'pointer' : 'not-allowed',
            marginBottom: '16px', transition: 'all 0.2s',
          }}
        >
          {addLoading ? 'Processing…' : `Add ${effectiveAmount > 0 ? `$${effectiveAmount.toFixed(2)}` : ''} to Wallet`}
        </button>

        {/* Security note */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          <Lock size={13} style={{ color: '#4B5563', flexShrink: 0, marginTop: '1px' }} />
          <p style={{ color: '#4B5563', fontSize: '12px', margin: 0, lineHeight: 1.5 }}>
            Payments are secured by Stripe. WhiteStellar never stores your card details.
          </p>
        </div>
      </section>

      {/* ── Transaction history ── */}
      <section id="tx-history" style={{ background: '#0D1221', border: '1px solid #1E2D45', borderRadius: '16px', padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 700, color: '#F0F4FF', margin: 0 }}>
            Transaction History
          </h2>
          <button
            title="Export CSV"
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'rgba(255,255,255,0.04)', border: '1px solid #1E2D45',
              color: '#8B9BB4', borderRadius: '8px', padding: '7px 12px',
              fontSize: '12px', cursor: 'pointer',
            }}
          >
            <Download size={14} /> Export CSV
          </button>
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {TX_FILTER_PILLS.map(pill => (
            <button
              key={pill.key}
              onClick={() => setTxFilter(pill.key)}
              style={{
                padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 500,
                border: `1px solid ${txFilter === pill.key ? '#C9A84C' : '#1E2D45'}`,
                background: txFilter === pill.key ? 'rgba(201,168,76,0.1)' : 'transparent',
                color: txFilter === pill.key ? '#C9A84C' : '#8B9BB4',
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Transaction rows */}
        {filteredTx.length === 0 ? (
          <p style={{ color: '#4B5563', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>
            {transactions.length === 0 ? 'No transactions yet.' : 'No transactions match this filter.'}
          </p>
        ) : (
          <div>
            {filteredTx.map((tx, i) => {
              const isDebit  = tx.amount < 0
              const isRefund = tx.type === 'refund'
              const amtColor = isDebit && !isRefund ? '#EF4444' : '#22C55E'
              const rowBg = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)'

              return (
                <div
                  key={tx.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '14px 12px', borderRadius: '8px',
                    background: rowBg,
                    borderTop: i > 0 ? '1px solid rgba(30,45,69,0.5)' : 'none',
                  }}
                >
                  {/* Icon */}
                  <div style={{ flexShrink: 0 }}>
                    {txIcon(tx.type)}
                  </div>

                  {/* Description + date */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 500, color: '#F0F4FF', fontSize: '13px', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tx.description}
                    </p>
                    <p style={{ color: '#4B5563', fontSize: '11px', margin: 0 }}>
                      {format(new Date(tx.created_at), 'MMM d, yyyy · h:mm a')}
                    </p>
                  </div>

                  {/* Amount + balance */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: '14px', color: amtColor, margin: '0 0 2px' }}>
                      {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                    </p>
                    <p style={{ color: '#4B5563', fontSize: '11px', margin: 0 }}>
                      bal: ${tx.balance_after.toFixed(2)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ── Saved payment methods ── */}
      <section style={{ background: '#0D1221', border: '1px solid #1E2D45', borderRadius: '16px', padding: '28px' }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 700, color: '#F0F4FF', margin: '0 0 20px' }}>
          Payment Methods
        </h2>

        {/* Saved card */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '14px',
          background: '#131929', border: '1px solid #1E2D45', borderRadius: '12px',
          padding: '16px 20px', marginBottom: '16px', flexWrap: 'wrap',
        }}>
          <CreditCard size={24} style={{ color: '#2DD4BF', flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <p style={{ fontWeight: 600, color: '#F0F4FF', fontSize: '14px', margin: 0 }}>
                Visa ending in 4242
              </p>
              <span style={{
                background: 'rgba(45,212,191,0.12)', color: '#2DD4BF',
                border: '1px solid rgba(45,212,191,0.3)',
                borderRadius: '20px', padding: '1px 8px', fontSize: '11px', fontWeight: 600,
              }}>
                Default
              </span>
            </div>
            <p style={{ color: '#4B5563', fontSize: '12px', margin: '3px 0 0' }}>Expires 12/27</p>
          </div>
          <button style={{
            background: 'none', border: 'none', color: '#EF4444',
            fontSize: '13px', cursor: 'pointer', fontWeight: 500,
          }}>
            Remove
          </button>
        </div>

        {/* Add card button */}
        <button style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'transparent', border: '1px solid rgba(201,168,76,0.4)',
          color: '#C9A84C', borderRadius: '10px', padding: '10px 20px',
          fontSize: '14px', fontWeight: 600, cursor: 'pointer',
        }}>
          + Add New Card
        </button>
      </section>

      <Toast message={toast.msg} visible={toast.visible} />
    </div>
  )
}

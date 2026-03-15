import { useState, useEffect } from 'react'
import {
  ArrowUpCircle, ArrowDownCircle, RefreshCw, Download,
  Lock, CheckCircle, XCircle, ChevronLeft, CreditCard,
} from 'lucide-react'
import { format } from 'date-fns'
import { useAuthStore } from '../../../store/authStore'
import { getTransactions, addToWallet } from '../../../lib/api/wallet'
import Toast from '../../../components/Toast'

const PRESET_AMOUNTS = [10, 25, 50, 100, 200]

type TxFilter = 'all' | 'deposit' | 'session_charge' | 'refund'
type WalletStep = 'amount' | 'card' | 'success' | 'error'

const TX_FILTER_PILLS: { key: TxFilter; label: string }[] = [
  { key: 'all',            label: 'All'             },
  { key: 'deposit',        label: 'Deposits'        },
  { key: 'session_charge', label: 'Session Charges' },
  { key: 'refund',         label: 'Refunds'         },
]

interface Transaction {
  id: string
  type: string
  amount: number
  balance_after: number
  created_at: string
  description: string
}

// ─── Helpers ──────────────────────────────────────────────────

function txIcon(type: string) {
  if (type === 'deposit') return <ArrowUpCircle size={18} style={{ color: '#22C55E' }} />
  if (type === 'refund')  return <RefreshCw size={18}      style={{ color: '#3B82F6' }} />
  return                         <ArrowDownCircle size={18} style={{ color: '#EF4444' }} />
}

function formatCardNumber(val: string) {
  return val.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ')
}

function formatExpiry(val: string) {
  const digits = val.replace(/\D/g, '').slice(0, 4)
  if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2)
  return digits
}

// ─── Mock checkout form ────────────────────────────────────────
// TODO: Replace with real Stripe <Elements> + <CheckoutForm> when
//       VITE_STRIPE_PUBLISHABLE_KEY and the create-payment-intent
//       Edge Function are ready for production.

function MockCheckoutForm({
  amount,
  onSuccess,
  onBack,
}: {
  amount: number
  onSuccess: () => void
  onBack: () => void
}) {
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry]         = useState('')
  const [cvv, setCvv]               = useState('')
  const [name, setName]             = useState('')
  const [loading, setLoading]       = useState(false)

  const inputStyle: React.CSSProperties = {
    width: '100%', background: '#131929', border: '1px solid #1E2D45',
    borderRadius: '10px', padding: '12px 14px',
    color: '#F0F4FF', fontSize: '14px', outline: 'none',
    boxSizing: 'border-box',
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    // Simulate network + processing delay
    await new Promise(resolve => setTimeout(resolve, 1800))
    setLoading(false)
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Back + TEST MODE badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'none', border: 'none', color: '#8B9BB4',
            fontSize: '13px', cursor: 'pointer', padding: 0,
          }}
        >
          <ChevronLeft size={16} /> Change amount
        </button>
        <span style={{
          background: 'rgba(245,158,11,0.15)', color: '#F59E0B',
          border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: '20px', padding: '2px 10px', fontSize: '11px', fontWeight: 700,
        }}>
          TEST MODE
        </span>
      </div>

      {/* Amount recap */}
      <div style={{
        background: '#131929', border: '1px solid rgba(201,168,76,0.3)',
        borderRadius: '12px', padding: '16px 20px', textAlign: 'center',
      }}>
        <p style={{ color: '#8B9BB4', fontSize: '12px', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Adding to wallet
        </p>
        <p style={{ color: '#C9A84C', fontSize: '32px', fontWeight: 700, margin: 0, lineHeight: 1 }}>
          ${amount.toFixed(2)}
        </p>
      </div>

      {/* Card number */}
      <div>
        <p style={{ fontSize: '12px', color: '#8B9BB4', margin: '0 0 8px' }}>Card Number</p>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="1234 5678 9012 3456"
            value={cardNumber}
            onChange={e => setCardNumber(formatCardNumber(e.target.value))}
            maxLength={19}
            required
            style={inputStyle}
          />
          <CreditCard
            size={16}
            style={{
              position: 'absolute', right: '12px', top: '50%',
              transform: 'translateY(-50%)', color: '#4B5563',
            }}
          />
        </div>
        <p style={{ fontSize: '11px', color: '#4B5563', margin: '4px 0 0' }}>
          Any number works in test mode
        </p>
      </div>

      {/* Expiry + CVV */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <p style={{ fontSize: '12px', color: '#8B9BB4', margin: '0 0 8px' }}>Expiry</p>
          <input
            type="text"
            placeholder="MM/YY"
            value={expiry}
            onChange={e => setExpiry(formatExpiry(e.target.value))}
            maxLength={5}
            required
            style={inputStyle}
          />
        </div>
        <div>
          <p style={{ fontSize: '12px', color: '#8B9BB4', margin: '0 0 8px' }}>CVV</p>
          <input
            type="text"
            placeholder="123"
            value={cvv}
            onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
            maxLength={4}
            required
            style={inputStyle}
          />
        </div>
      </div>

      {/* Cardholder name */}
      <div>
        <p style={{ fontSize: '12px', color: '#8B9BB4', margin: '0 0 8px' }}>Cardholder Name</p>
        <input
          type="text"
          placeholder="Full name on card"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          style={inputStyle}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%', height: '50px', borderRadius: '12px', border: 'none',
          background: loading ? '#1E2D45' : '#C9A84C',
          color: loading ? '#4B5563' : '#0B0F1A',
          fontSize: '15px', fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        }}
      >
        {loading
          ? <>
              <span style={{
                width: '16px', height: '16px', border: '2px solid #4B5563',
                borderTopColor: '#8B9BB4', borderRadius: '50%',
                animation: 'spin 0.7s linear infinite', display: 'inline-block',
              }} />
              Processing…
            </>
          : `Pay $${amount.toFixed(2)}`
        }
      </button>

      {/* Security note */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
        <Lock size={13} style={{ color: '#4B5563', flexShrink: 0, marginTop: '1px' }} />
        <p style={{ color: '#4B5563', fontSize: '12px', margin: 0, lineHeight: 1.5 }}>
          Test mode — no real charges. Stripe will be activated before launch.
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </form>
  )
}

// ─── Wallet page ──────────────────────────────────────────────

export default function Wallet() {
  const { user, updateWalletBalance } = useAuthStore()

  // Top-up flow state
  const [step, setStep]                 = useState<WalletStep>('amount')
  const [selectedPreset, setSelectedPreset] = useState<number | null>(50)
  const [customInput, setCustomInput]   = useState('')
  const [intentAmount, setIntentAmount] = useState(0)
  const [errorMsg, setErrorMsg]         = useState('')

  // Transaction history
  const [txFilter, setTxFilter]         = useState<TxFilter>('all')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [toast, setToast]               = useState({ msg: '', visible: false })

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

  function handleContinueToPayment() {
    if (effectiveAmount <= 0 || !user?.id) return
    setIntentAmount(effectiveAmount)
    setStep('card')
  }

  async function handlePaymentSuccess() {
    setStep('success')
    try {
      if (user?.id) {
        // Write the deposit to Supabase — updates wallet_balance + inserts transaction row
        const newBalance = await addToWallet(user.id, intentAmount, 'Wallet top-up')
        updateWalletBalance(newBalance)
        const txs = await getTransactions(user.id)
        setTransactions(txs)
      }
    } catch (err) {
      console.error('Failed to update wallet after mock payment:', err)
      showToast('Balance will refresh on next load.')
    }
  }

  function resetTopUp() {
    setStep('amount')
    setSelectedPreset(50)
    setCustomInput('')
    setIntentAmount(0)
    setErrorMsg('')
  }

  const filteredTx = transactions.filter(t =>
    txFilter === 'all' ? true : t.type === txFilter
  )

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
          ${(user?.walletBalance ?? 0).toFixed(2)}
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => { resetTopUp(); document.getElementById('add-funds')?.scrollIntoView({ behavior: 'smooth' }) }}
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

      {/* ── Top Up / Checkout section ── */}
      <section id="add-funds" style={{ background: '#0D1221', border: '1px solid #1E2D45', borderRadius: '16px', padding: '28px' }}>

        {/* Step: Success */}
        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <CheckCircle size={52} color="#22C55E" style={{ marginBottom: '16px' }} />
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 700, color: '#F0F4FF', margin: '0 0 10px' }}>
              Payment Successful!
            </h2>
            <p style={{ color: '#8B9BB4', fontSize: '14px', margin: '0 0 6px' }}>
              <strong style={{ color: '#C9A84C' }}>${intentAmount.toFixed(2)}</strong> has been added to your wallet.
            </p>
            <p style={{ color: '#4B5563', fontSize: '13px', margin: '0 0 28px' }}>
              Your balance has been updated.
            </p>
            <button
              onClick={resetTopUp}
              style={{
                background: '#C9A84C', color: '#0B0F1A', borderRadius: '10px',
                padding: '12px 32px', fontWeight: 700, fontSize: '14px',
                border: 'none', cursor: 'pointer',
              }}
            >
              Add More Funds
            </button>
          </div>
        )}

        {/* Step: Error */}
        {step === 'error' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <XCircle size={52} color="#EF4444" style={{ marginBottom: '16px' }} />
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 700, color: '#F0F4FF', margin: '0 0 10px' }}>
              Payment Failed
            </h2>
            <p style={{ color: '#8B9BB4', fontSize: '14px', margin: '0 0 28px' }}>
              {errorMsg}
            </p>
            <button
              onClick={() => setStep('card')}
              style={{
                background: '#C9A84C', color: '#0B0F1A', borderRadius: '10px',
                padding: '12px 32px', fontWeight: 700, fontSize: '14px',
                border: 'none', cursor: 'pointer', marginRight: '12px',
              }}
            >
              Try Again
            </button>
            <button
              onClick={resetTopUp}
              style={{
                background: 'transparent', color: '#8B9BB4', borderRadius: '10px',
                padding: '12px 24px', fontWeight: 600, fontSize: '14px',
                border: '1px solid #1E2D45', cursor: 'pointer',
              }}
            >
              Change Amount
            </button>
          </div>
        )}

        {/* Step: Card (mock checkout) */}
        {step === 'card' && (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 700, color: '#F0F4FF', margin: '0 0 24px' }}>
              Payment Details
            </h2>
            <MockCheckoutForm
              amount={intentAmount}
              onSuccess={handlePaymentSuccess}
              onBack={resetTopUp}
            />
          </div>
        )}

        {/* Step: Amount selection */}
        {step === 'amount' && (
          <>
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
            <div style={{ marginBottom: '28px' }}>
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

            {/* CTA */}
            <button
              onClick={handleContinueToPayment}
              disabled={effectiveAmount <= 0}
              style={{
                width: '100%', height: '50px', borderRadius: '12px', border: 'none',
                background: effectiveAmount > 0 ? '#C9A84C' : '#1E2D45',
                color: effectiveAmount > 0 ? '#0B0F1A' : '#4B5563',
                fontSize: '15px', fontWeight: 700,
                cursor: effectiveAmount > 0 ? 'pointer' : 'not-allowed',
                marginBottom: '16px', transition: 'all 0.2s',
              }}
            >
              {`Continue ${effectiveAmount > 0 ? `— $${effectiveAmount.toFixed(2)}` : ''}`}
            </button>

            {/* Security note */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <Lock size={13} style={{ color: '#4B5563', flexShrink: 0, marginTop: '1px' }} />
              <p style={{ color: '#4B5563', fontSize: '12px', margin: 0, lineHeight: 1.5 }}>
                Payments are secured by Stripe. WhiteStellar never stores your card details.
              </p>
            </div>
          </>
        )}
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
                  <div style={{ flexShrink: 0 }}>
                    {txIcon(tx.type)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 500, color: '#F0F4FF', fontSize: '13px', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tx.description}
                    </p>
                    <p style={{ color: '#4B5563', fontSize: '11px', margin: 0 }}>
                      {format(new Date(tx.created_at), 'MMM d, yyyy · h:mm a')}
                    </p>
                  </div>
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

      <Toast message={toast.msg} visible={toast.visible} />
    </div>
  )
}

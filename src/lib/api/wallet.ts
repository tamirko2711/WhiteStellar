// ============================================================
// WhiteStellar — Wallet API
// src/lib/api/wallet.ts
// ============================================================

import { supabase } from '../supabase'

export const getWalletBalance = async (clientId: string): Promise<number> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('wallet_balance')
    .eq('id', clientId)
    .single()
  if (error) throw error
  return data.wallet_balance ?? 0
}

export const deductFromWallet = async (
  clientId: string,
  amount: number,
  sessionId: string,
  description: string,
): Promise<number> => {
  const { data: profile } = await supabase
    .from('profiles')
    .select('wallet_balance')
    .eq('id', clientId)
    .single()

  const balanceBefore = profile?.wallet_balance ?? 0
  const balanceAfter = Math.max(0, balanceBefore - amount)

  await supabase
    .from('profiles')
    .update({ wallet_balance: balanceAfter })
    .eq('id', clientId)

  await supabase.from('transactions').insert({
    client_id: clientId,
    session_id: sessionId,
    type: 'session_charge',
    amount: -amount,
    balance_before: balanceBefore,
    balance_after: balanceAfter,
    description,
  })

  return balanceAfter
}

export const addToWallet = async (
  clientId: string,
  amount: number,
  description: string,
): Promise<number> => {
  const { data: profile } = await supabase
    .from('profiles')
    .select('wallet_balance')
    .eq('id', clientId)
    .single()

  const balanceBefore = profile?.wallet_balance ?? 0
  const balanceAfter = balanceBefore + amount

  await supabase
    .from('profiles')
    .update({ wallet_balance: balanceAfter })
    .eq('id', clientId)

  await supabase.from('transactions').insert({
    client_id: clientId,
    type: 'deposit',
    amount,
    balance_before: balanceBefore,
    balance_after: balanceAfter,
    description,
  })

  return balanceAfter
}

export const getTransactions = async (clientId: string) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

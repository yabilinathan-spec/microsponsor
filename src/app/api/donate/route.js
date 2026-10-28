import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

const CURRENCIES = ['USD', 'CDF', 'EUR', 'USDT', 'XOF']
const OPERATORS = ['M-Pesa', 'Airtel Money', 'Orange Money', 'Wave', 'MTN Mobile Money']
const MIN_AMOUNT = 0.1
const MAX_AMOUNT = 10000

const round2 = (n) => Math.round(n * 100) / 100

export async function POST(req) {
  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 })
  }

  const { username, amount, currency, operator, phoneNumber, donorName } = body || {}
  const value = Number(amount)

  if (typeof username !== 'string' || !username.trim()) {
    return NextResponse.json({ error: 'Créateur invalide.' }, { status: 400 })
  }
  if (!Number.isFinite(value) || value < MIN_AMOUNT || value > MAX_AMOUNT) {
    return NextResponse.json({ error: 'Montant invalide.' }, { status: 400 })
  }
  if (!CURRENCIES.includes(currency)) {
    return NextResponse.json({ error: 'Devise invalide.' }, { status: 400 })
  }
  if (!OPERATORS.includes(operator)) {
    return NextResponse.json({ error: 'Opérateur invalide.' }, { status: 400 })
  }
  const phone = String(phoneNumber || '').replace(/\s+/g, '')
  if (!/^\+?[0-9]{8,15}$/.test(phone)) {
    return NextResponse.json({ error: 'Numéro de téléphone invalide.' }, { status: 400 })
  }
  const donor = String(donorName || '').trim().slice(0, 60) || 'Anonyme'

  // Le taux vit uniquement ici, côté serveur (variable d'environnement)
  const rate = Number(process.env.COMMISSION_RATE ?? 0.08)
  const adminFee = round2(value * rate)
  const netAmount = round2(value - adminFee)

  // Échappe les jokers % et _ pour la recherche insensible à la casse
  const safeUsername = username.trim().replace(/[\\%_]/g, '\\$&')
  const { data: creator, error: creatorErr } = await supabaseAdmin
    .from('creators')
    .select('id, recolte_total')
    .ilike('username', safeUsername)
    .maybeSingle()

  if (creatorErr || !creator) {
    return NextResponse.json({ error: 'Créateur introuvable.' }, { status: 404 })
  }

  const { error: insertErr } = await supabaseAdmin.from('donations').insert({
    creator_id: creator.id,
    donor_name: donor,
    amount: value,
    admin_fee: adminFee,
    net_amount: netAmount,
    currency,
    operator,
    phone_number: phone,
  })

  if (insertErr) {
    console.error('Insertion du don échouée :', insertErr.message)
    return NextResponse.json({ error: "Erreur lors de l'enregistrement du don." }, { status: 500 })
  }

  // La jauge d'objectif est en USD : on n'y ajoute que les dons en USD / USDT
  let newTotal = Number(creator.recolte_total || 0)
  if (currency === 'USD' || currency === 'USDT') {
    newTotal = round2(newTotal + netAmount)
    const { error: updateErr } = await supabaseAdmin
      .from('creators')
      .update({ recolte_total: newTotal })
      .eq('id', creator.id)
    if (updateErr) console.error('Mise à jour recolte_total échouée :', updateErr.message)
  }

  // Le navigateur ne reçoit jamais la commission ni le taux
  return NextResponse.json({ ok: true, amount: value, currency, recolteTotal: newTotal })
}
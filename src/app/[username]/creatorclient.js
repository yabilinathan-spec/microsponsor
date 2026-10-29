'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const DEVISES = {
  USD: { nom: 'Dollar', taux: 1, choix: [0.1, 0.5, 1, 5] },
  CDF: { nom: 'Franc congolais', taux: 2800, choix: [300, 1500, 3000, 15000] },
  XOF: { nom: 'Franc CFA', taux: 600, choix: [100, 500, 1000, 3000] },
  EUR: { nom: 'Euro', taux: 0.92, choix: [0.1, 0.5, 1, 5] },
  KES: { nom: 'Shilling kényan', taux: 129, choix: [15, 65, 130, 650] },
  GHS: { nom: 'Cedi ghanéen', taux: 11, choix: [1.5, 5, 10, 50] },
}

const OPERATEURS = ['M-Pesa', 'Airtel Money', 'Orange Money', 'Wave', 'MTN Mobile Money']

export default function CreatorClient({ username }) {
  const [totalRecolte, setTotalRecolte] = useState(0)
  const [devise, setDevise] = useState('USD')
  const [montant, setMontant] = useState(1)
  const [showCustom, setShowCustom] = useState(false)
  const [custom, setCustom] = useState('')
  const [operateur, setOperateur] = useState('')
  const [phone, setPhone] = useState('')
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')
  const objectifGoal = 500

  async function fetchDonations() {
    const { data, error } = await supabase
      .from('donations')
      .select('amount')
      .eq('creator_username', username)

    if (!error && data) {
      setTotalRecolte(data.reduce((acc, curr) => acc + Number(curr.amount || 0), 0))
    }
  }

  useEffect(() => {
    fetchDonations()
  }, [username])

  const pourcentage = Math.min(Math.round((totalRecolte / objectifGoal) * 100), 100)
  const d = DEVISES[devise]

  const changerDevise = (code) => {
    setDevise(code)
    setMontant(DEVISES[code].choix[2])
    setCustom('')
    setShowCustom(false)
  }

  const donner = async () => {
    const valeurLocale = showCustom ? Number(custom) : montant
    const enUSD = valeurLocale / d.taux

    if (!valeurLocale || enUSD < 0.099) {
      setMessage('Le montant minimum est équivalent à 0,10 $.')
      return
    }
    if (!operateur) {
      setMessage('Choisis un opérateur mobile.')
      return
    }
    if (!phone || phone.trim().length < 8) {
      setMessage('Veuillez entrer un numéro de téléphone valide.')
      return
    }

    setSending(true)
    setMessage('')

    try {
      // 1. Déclenchement du paiement Mobile Money (API Gateway Backend)
      const res = await fetch('/api/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: valeurLocale,
          currency: devise,
          phone: phone,
          operator: operateur,
          creator: username,
        }),
      })

      const paymentResult = await res.json()

      if (!res.ok || !paymentResult.success) {
        throw new Error(paymentResult.message || 'Échec du retrait Mobile Money.')
      }

      // 2. Enregistrement du don dans Supabase
      const { error } = await supabase.from('donations').insert({
        creator_username: username,
        amount: Number(enUSD.toFixed(2)),
        phone_number: phone,
        operator: operateur,
      })

      if (error) {
        setMessage('Paiement réussi, mais enregistrement échoué : ' + error.message)
      } else {
        setMessage('Demande de retrait envoyée ! Validez le prompt/USSD sur votre téléphone. 💜')
        setCustom('')
        setShowCustom(false)
        setPhone('')
        fetchDonations()
      }
    } catch (err) {
      setMessage(err.message || 'Une erreur est survenue.')
    } finally {
      setSending(false)
    }
  }

  const btn = (actif) =>
    `py-3 rounded-xl font-bold border text-sm transition-colors ${
      actif ? 'bg-purple-600 border-purple-500' : 'bg-gray-800 border-gray-700'
    }`

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 flex flex-col items-center">
      <div className="max-w-md w-full space-y-6 mt-10">
        <h1 className="text-3xl font-bold text-center capitalize">{username}</h1>

        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 text-center space-y-4">
          <p className="text-gray-400 text-sm font-medium">Objectif de collecte</p>
          <div className="text-2xl font-bold text-green-400">${objectifGoal} USD</div>
          <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden p-0.5 border border-gray-700">
            <div
              className="bg-green-500 h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${pourcentage}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 text-center space-y-5">
          <p className="text-gray-300 font-medium">Soutenir {username}</p>

          {/* Devise */}
          <div>
            <p className="text-gray-400 text-xs mb-2">Devise</p>
            <div className="grid grid-cols-3 gap-2">
              {Object.keys(DEVISES).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => changerDevise(code)}
                  className={btn(devise === code)}
                >
                  {code}
                </button>
              ))}
            </div>
            <p className="text-gray-500 text-xs mt-1">{d.nom}</p>
          </div>

          {/* Montant */}
          <div>
            <p className="text-gray-400 text-xs mb-2">Montant en {devise}</p>
            <div className="grid grid-cols-5 gap-2">
              {d.choix.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setMontant(c)
                    setShowCustom(false)
                    setCustom('')
                  }}
                  className={btn(!showCustom && montant === c)}
                >
                  {c}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowCustom(!showCustom)}
                className={btn(showCustom)}
              >
                +
              </button>
            </div>

            {showCustom && (
              <input
                type="number"
                min="0"
                step="any"
                placeholder={`Montant personnalisé (${devise})`}
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                className="w-full mt-3 bg-gray-800 border border-gray-700 rounded-xl p-3 text-white text-center focus:outline-none focus:border-purple-500"
              />
            )}
          </div>

          {/* Opérateur */}
          <div>
            <p className="text-gray-400 text-xs mb-2">Mobile money</p>
            <div className="grid grid-cols-2 gap-2">
              {OPERATEURS.map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setOperateur(o)}
                  className={btn(operateur === o)}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          {/* Numéro de téléphone */}
          <div>
            <p className="text-gray-400 text-xs mb-2">Numéro de téléphone (Mobile Money)</p>
            <input
              type="tel"
              placeholder="ex: +243810000000 ou 0810000000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white text-center focus:outline-none focus:border-purple-500"
            />
          </div>

          <button
            type="button"
            onClick={donner}
            disabled={sending}
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-60 font-bold py-3 rounded-xl transition-colors"
          >
            {sending ? 'Traitement en cours…' : 'Donner'}
          </button>

          {message && <p className="text-sm text-gray-300">{message}</p>}
        </div>
      </div>
    </div>
  )
}
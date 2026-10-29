'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function CreatorClient({ username }) {
  const [totalRecolte, setTotalRecolte] = useState(0)
  const [montant, setMontant] = useState(1)
  const [custom, setCustom] = useState('')
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')
  const objectifGoal = 500
  const choix = [0.1, 0.5, 1, 5]

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

  const donner = async () => {
    const valeur = custom ? Number(custom) : montant
    if (!valeur || valeur < 0.1) {
      setMessage('Le montant minimum est de 0,10 $.')
      return
    }
    setSending(true)
    setMessage('')

    const { error } = await supabase
      .from('donations')
      .insert({ creator_username: username, amount: valeur })

    if (error) {
      setMessage('Erreur : ' + error.message)
    } else {
      setMessage('Merci pour votre soutien ! 💜')
      setCustom('')
      fetchDonations()
    }
    setSending(false)
  }

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

        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 text-center space-y-4">
          <p className="text-gray-300 font-medium">Soutenir {username}</p>

          <div className="grid grid-cols-4 gap-2">
            {choix.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => { setMontant(c); setCustom('') }}
                className={`py-3 rounded-xl font-bold border ${
                  !custom && montant === c
                    ? 'bg-purple-600 border-purple-500'
                    : 'bg-gray-800 border-gray-700'
                }`}
              >
                ${c}
              </button>
            ))}
          </div>

          <input
            type="number"
            min="0.1"
            step="0.1"
            placeholder="Autre montant ($)"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white text-center focus:outline-none focus:border-purple-500"
          />

          <button
            type="button"
            onClick={donner}
            disabled={sending}
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-60 font-bold py-3 rounded-xl"
          >
            {sending ? 'Envoi…' : 'Donner'}
          </button>

          {message && <p className="text-sm text-gray-300">{message}</p>}
        </div>
      </div>
    </div>
  )
}
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function CreatorClient({ username }) {
  const [totalRecolte, setTotalRecolte] = useState(0)
  const objectifGoal = 500 // Objectif de $500 USD

  useEffect(() => {
    async function fetchDonations() {
      const { data, error } = await supabase
        .from('donations')
        .select('amount')
        .eq('creator_username', username)

      if (!error && data) {
        const total = data.reduce((acc, curr) => acc + Number(curr.amount || 0), 0)
        setTotalRecolte(total)
      }
    }

    fetchDonations()
  }, [username])

  const pourcentage = Math.min(Math.round((totalRecolte / objectifGoal) * 100), 100)

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 flex flex-col items-center">
      <div className="max-w-md w-full space-y-6 mt-10">
        <h1 className="text-3xl font-bold text-center capitalize">{username}</h1>

        {/* OBJECTIF + BARRE (aucun montant ni pourcentage affiché) */}
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 text-center space-y-4">
          <p className="text-gray-400 text-sm font-medium">Objectif de collecte</p>

          <div className="text-2xl font-bold text-green-400">
            ${objectifGoal} USD
          </div>

          <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden p-0.5 border border-gray-700">
            <div
              className="bg-green-500 h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${pourcentage}%` }}
            ></div>
          </div>
        </div>

        {/* Formulaire de Don */}
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 text-center space-y-4">
          <p className="text-gray-300 font-medium">Soutenir {username}</p>
          {/* Vos boutons Mobile Money / Formulaire de paiement ici */}
        </div>
      </div>
    </div>
  )
}
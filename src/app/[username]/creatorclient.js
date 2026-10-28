'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function CreatorClient({ username }) {
  const [totalRecolte, setTotalRecolte] = useState(0)
  const objectifGoal = 500 // Objectif de $500 USD (personnalisable plus tard)

  useEffect(() => {
    async function fetchDonations() {
      // Charger le total des dons pour ce créateur
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

  // Calcul du pourcentage de progression (max 100%)
  const pourcentage = Math.min(Math.round((totalRecolte / objectifGoal) * 100), 100)

  return (
    <div className="max-w-md mx-auto p-4 space-y-6 text-white min-h-screen bg-gray-950">
      <h1 className="text-3xl font-bold text-center capitalize">{username}</h1>

      {/* BLOC OBJECTIF DE COLLECTE AVEC BARRE DE PROGRESSION (POUR LE PUBLIC) */}
      <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 text-center space-y-4">
        <p className="text-gray-400 text-sm font-medium">Objectif de collecte</p>
        
        {/* Affichage du pourcentage et de l'objectif global */}
        <div className="text-2xl font-bold text-green-400">
          {pourcentage}% <span className="text-gray-400 text-base font-normal">sur ${objectifGoal} USD</span>
        </div>

        {/* Barre de progression visuelle */}
        <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden p-0.5 border border-gray-700">
          <div 
            className="bg-green-500 h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${pourcentage}%` }}
          ></div>
        </div>
      </div>

      {/* Reste du formulaire de don / boutons de paiement en dessous */}
    </div>
  )
}
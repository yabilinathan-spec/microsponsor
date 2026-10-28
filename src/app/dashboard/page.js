'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export default function CreatorDashboard() {
  const [stats, setStats] = useState({ count: 0, total: 0 })

  useEffect(() => {
    async function loadStats() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Récupération des dons reçus par le créateur connecté
      const { data, error } = await supabase
        .from('donations')
        .select('amount')
        .eq('user_id', user.id)

      if (!error && data) {
        const count = data.length
        const total = data.reduce((acc, curr) => acc + Number(curr.amount || 0), 0)
        setStats({ count, total })
      }
    }

    loadStats()
  }, [])

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 text-white">
      <div className="grid grid-cols-2 gap-4">
        {/* Nombre de dons reçus */}
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
          <p className="text-gray-400 text-sm">Dons reçus</p>
          <p className="text-4xl font-bold mt-2 text-white">{stats.count}</p>
        </div>

        {/* Total net récolté par le créateur */}
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
          <p className="text-gray-400 text-sm">Total reçu</p>
          <p className="text-4xl font-bold mt-2 text-green-400">${stats.total.toFixed(2)}</p>
        </div>
      </div>
    </div>
  )
}
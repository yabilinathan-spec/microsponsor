'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

// ❌ ligne supprimée : export const dynamic = 'force-dynamic'

export default function CreatorDashboard() {
  const [stats, setStats] = useState({ count: 0, total: 0 })

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('donations')
        .select('amount')

      if (data) {
        setStats({
          count: data.length,
          total: data.reduce((s, d) => s + Number(d.amount), 0),
        })
      }
    }
    load()
    const id = setInterval(load, 10000) // mise à jour auto
    return () => clearInterval(id)
  }, [])

  // ... ton JSX actuel ici, inchangé
}
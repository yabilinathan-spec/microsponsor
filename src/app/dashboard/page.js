'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function CreatorDashboard() {
  const [loading, setLoading] = useState(true)
  const [creator, setCreator] = useState(null)
  const [stats, setStats] = useState({ count: 0, total: 0 })

  useEffect(() => {
    let timer
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/connexion'
        return
      }

      const { data: c } = await supabase
        .from('creators')
        .select('username, nom_affichage')
        .eq('user_id', user.id)
        .maybeSingle()

      setCreator(c)
      setLoading(false)
      if (!c) return

      async function load() {
        const { data } = await supabase
          .from('donations')
          .select('amount')
          .eq('creator_username', c.username)
        if (data) {
          setStats({
            count: data.length,
            total: data.reduce((s, d) => s + Number(d.amount || 0), 0),
          })
        }
      }
      load()
      timer = setInterval(load, 10000)
    }
    init()
    return () => clearInterval(timer)
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0b1020] text-white flex items-center justify-center">
        <p className="text-slate-400">Chargement…</p>
      </main>
    )
  }

  if (!creator) {
    return (
      <main className="min-h-screen bg-[#0b1020] text-white flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl max-w-md w-full text-center space-y-4">
          <p>Aucune page créateur n'est liée à ce compte.</p>
          <button onClick={logout} className="text-purple-400 font-semibold">Se déconnecter</button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0b1020] text-white p-4">
      <div className="max-w-md mx-auto space-y-6 mt-6">
        <h1 className="text-2xl font-bold text-center">
          Bonjour {creator.nom_affichage || creator.username}
        </h1>

        <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl text-center">
          <p className="text-slate-400 text-sm">Total reçu</p>
          <p className="text-4xl font-bold text-green-400 mt-2">${stats.total.toFixed(2)}</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl text-center">
          <p className="text-slate-400 text-sm">Nombre de dons</p>
          <p className="text-3xl font-bold mt-2">{stats.count}</p>
        </div>

        <Link
          href={`/${creator.username}`}
          className="block text-center bg-purple-600 hover:bg-purple-500 font-bold py-3 rounded-xl"
        >
          Voir ma page publique
        </Link>

        <button onClick={logout} className="block mx-auto text-slate-400 text-sm">
          Se déconnecter
        </button>
      </div>
    </main>
  )
}
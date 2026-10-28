'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function CreatorDashboard() {
  const [creator, setCreator] = useState(null)
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const [missing, setMissing] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        window.location.href = '/connexion'
        return
      }

      const { data: c } = await supabase
        .from('creators')
        .select('id, username, nom_affichage')
        .eq('user_id', session.user.id)
        .maybeSingle()

      if (!c) {
        setMissing(true)
        setLoading(false)
        return
      }
      setCreator(c)

      const { data: d } = await supabase
        .from('donations')
        .select('id, donor_name, net_amount, currency, created_at')
        .eq('creator_id', c.id)
        .order('created_at', { ascending: false })

      setDonations(d || [])
      setLoading(false)
    }
    load()
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1020] text-white flex items-center justify-center">
        <p className="animate-pulse">Chargement…</p>
      </div>
    )
  }

  if (missing) {
    return (
      <main className="min-h-screen bg-[#0b1020] text-white flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl max-w-md w-full text-center">
          <p className="mb-4">Aucun profil créateur n’est lié à ce compte.</p>
          <button onClick={logout} className="text-purple-400 font-semibold">Se déconnecter</button>
        </div>
      </main>
    )
  }

  const totals = donations.reduce((acc, d) => {
    const cur = d.currency || 'USD'
    acc[cur] = (acc[cur] || 0) + Number(d.net_amount || 0)
    return acc
  }, {})

  const link = `${typeof window !== 'undefined' ? window.location.origin : ''}/${creator.username}`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <main className="min-h-screen bg-[#0b1020] text-white p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Salut {creator.nom_affichage || creator.username} 👋</h1>
            <p className="text-slate-400 text-sm">Ton espace créateur</p>
          </div>
          <button
            onClick={logout}
            className="bg-red-600/20 border border-red-500/50 hover:bg-red-600/30 text-red-300 px-4 py-2 rounded-xl text-sm font-medium transition"
          >
            Déconnexion
          </button>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 mb-6">
          <p className="text-sm text-slate-400 mb-2">Ton lien à mettre dans ta bio</p>
          <div className="flex gap-2">
            <input readOnly value={link} className="flex-1 min-w-0 bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-purple-300" />
            <button onClick={copy} className="bg-purple-600 hover:bg-purple-500 font-bold px-4 rounded-xl transition">
              {copied ? 'Copié ✓' : 'Copier'}
            </button>
          </div>
          <Link href={`/${creator.username}`} className="inline-block mt-3 text-sm text-purple-400 font-semibold">
            Voir ma page publique →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
            <p className="text-sm text-slate-400 mb-1">Dons reçus</p>
            <p className="text-3xl font-bold">{donations.length}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
            <p className="text-sm text-slate-400 mb-1">Total reçu</p>
            {Object.keys(totals).length === 0 ? (
              <p className="text-3xl font-bold text-green-400">0</p>
            ) : (
              Object.entries(totals).map(([cur, val]) => (
                <p key={cur} className="text-xl font-bold text-green-400">
                  {val.toFixed(2)} {cur}
                </p>
              ))
            )}
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-700">
            <h2 className="text-lg font-bold">Mes derniers dons</h2>
          </div>
          {donations.length === 0 ? (
            <p className="p-6 text-center text-slate-400 text-sm">
              Aucun don pour le moment. Partage ton lien pour commencer !
            </p>
          ) : (
            <ul className="divide-y divide-slate-700">
              {donations.map((d) => (
                <li key={d.id} className="p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{d.donor_name || 'Anonyme'}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(d.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-green-400 font-bold whitespace-nowrap">
                    +{d.net_amount} {d.currency}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  )
}
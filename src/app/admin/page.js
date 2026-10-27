'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const ADMIN_EMAIL = 'yabilinathan813@gmail.com'

export default function AdminDashboard() {
  const [session, setSession] = useState(null)
  const [checking, setChecking] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)

  const isAdmin = session?.user?.email?.toLowerCase() === ADMIN_EMAIL

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setChecking(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!isAdmin) return
    async function fetchDonations() {
      const { data, error } = await supabase
        .from('donations')
        .select('*, creators(nom_affichage, username)')
        .order('created_at', { ascending: false })
      if (!error) setDonations(data || [])
      setLoading(false)
    }
    fetchDonations()
  }, [isAdmin])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (err) setError(err.message)
  }

  const logout = async () => {
    await supabase.auth.signOut()
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <p className="animate-pulse">Chargement…</p>
      </div>
    )
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl shadow-2xl max-w-md w-full">
          <h1 className="text-2xl font-bold mb-2 text-center">Accès Administrateur 🔐</h1>
          <p className="text-slate-400 text-sm mb-6 text-center">Connecte-toi avec le compte administrateur.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
              required
            />
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
              required
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/30"
            >
              Se connecter
            </button>
          </form>
        </div>
      </main>
    )
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl max-w-md w-full text-center">
          <p className="mb-4">Accès refusé : ce compte n’est pas administrateur.</p>
          <button onClick={logout} className="text-blue-400 font-semibold">Se déconnecter</button>
        </div>
      </main>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <p className="text-lg animate-pulse">Chargement du tableau de bord...</p>
      </div>
    )
  }

  const totalCollected = donations.reduce((acc, curr) => acc + Number(curr.amount), 0)
  const totalAdminFees = donations.reduce((acc, curr) => acc + Number(curr.admin_fee), 0)
  const totalNetCreators = donations.reduce((acc, curr) => acc + Number(curr.net_amount), 0)

  return (
    <main className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Tableau de bord Admin 🔐</h1>
            <p className="text-slate-400">Suivi en temps réel de tous les dons et des commissions perçues (8%).</p>
          </div>
          <button
            onClick={logout}
            className="bg-red-600/20 border border-red-500/50 hover:bg-red-600/30 text-red-300 px-4 py-2 rounded-xl text-sm font-medium transition-all"
          >
            Se déconnecter
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl">
            <p className="text-sm text-slate-400 mb-1">Total Brut Collecté</p>
            <p className="text-3xl font-bold text-white">${totalCollected.toFixed(2)}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl">
            <p className="text-sm text-slate-400 mb-1">Commissions Admin (8%)</p>
            <p className="text-3xl font-bold text-yellow-400">${totalAdminFees.toFixed(2)}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl">
            <p className="text-sm text-slate-400 mb-1">Total Net Versé aux Créateurs</p>
            <p className="text-3xl font-bold text-green-400">${totalNetCreators.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-xl font-bold">Historique des Transactions</h2>
          </div>

          {donations.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              Aucun don enregistré pour le moment.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-700/50 text-slate-400 text-sm uppercase tracking-wider">
                    <th className="p-4">Date</th>
                    <th className="p-4">Donateur</th>
                    <th className="p-4">Créateur</th>
                    <th className="p-4">Montant Brut</th>
                    <th className="p-4">Commission (8%)</th>
                    <th className="p-4">Net Créateur</th>
                    <th className="p-4">Opérateur & Téléphone</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700 text-sm">
                  {donations.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="p-4 text-slate-400">
                        {new Date(d.created_at).toLocaleDateString()} {new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-4 font-semibold text-white">{d.donor_name}</td>
                      <td className="p-4 text-blue-400">@{d.creators?.username || 'Inconnu'}</td>
                      <td className="p-4 font-bold text-white">{d.amount} {d.currency}</td>
                      <td className="p-4 text-yellow-400">-{d.admin_fee} {d.currency}</td>
                      <td className="p-4 text-green-400 font-bold">+{d.net_amount} {d.currency}</td>
                      <td className="p-4">
                        <span className="bg-slate-700 px-2.5 py-1 rounded-lg text-xs font-medium mr-2">{d.operator}</span>
                        <span className="text-slate-300">{d.phone_number}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
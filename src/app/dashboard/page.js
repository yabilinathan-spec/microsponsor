'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)

  // Mot de passe admin (vous pourrez le modifier ici facilement)
  const ADMIN_PASSWORD = "admin123"

  const handleLogin = (e) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
    } else {
      alert("Mot de passe incorrect !")
    }
  }

  useEffect(() => {
    if (!isAuthenticated) return

    async function fetchDonations() {
      const { data, error } = await supabase
        .from('donations')
        .select('*, creators(nom_affichage, username)')
        .order('created_at', { ascending: false })

      if (!error) {
        setDonations(data || [])
      }
      setLoading(false)
    }
    fetchDonations()
  }, [isAuthenticated])

  // Si non connecté, afficher le formulaire de mot de passe
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl shadow-2xl max-w-md w-full">
          <h1 className="text-2xl font-bold mb-2 text-center">Accès Administrateur 🔐</h1>
          <p className="text-slate-400 text-sm mb-6 text-center">Entrez votre mot de passe pour accéder au suivi des revenus.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Mot de passe :</label>
              <input
                type="password"
                placeholder="Entrez le mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <p className="text-lg animate-pulse">Chargement du tableau de bord...</p>
      </div>
    )
  }

  // Calculs totaux
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
            onClick={() => setIsAuthenticated(false)}
            className="bg-red-600/20 border border-red-500/50 hover:bg-red-600/30 text-red-300 px-4 py-2 rounded-xl text-sm font-medium transition-all"
          >
            Se déconnecter
          </button>
        </div>

        {/* Cartes de statistiques */}
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

        {/* Tableau des transactions */}
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
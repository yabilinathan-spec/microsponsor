'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import confetti from 'canvas-confetti'

export default function CreatorClient({ username }) {
  const [creator, setCreator] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showDonateModal, setShowDonateModal] = useState(false)

  // États du formulaire de don
  const [amount, setAmount] = useState('1')
  const [customAmount, setCustomAmount] = useState('')
  const [isCustom, setIsCustom] = useState(false)
  const [currency, setCurrency] = useState('USD')
  const [operator, setOperator] = useState('M-Pesa')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [donorName, setDonorName] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    async function fetchCreator() {
      if (!username) return
      const { data } = await supabase
        .from('creators')
        .select('*')
        .ilike('username', username)
        .maybeSingle()

      setCreator(data)
      setLoading(false)
    }
    fetchCreator()
  }, [username])

  const handleDonate = async (e) => {
    e.preventDefault()
    const totalDonated = isCustom ? parseFloat(customAmount) : parseFloat(amount)
    if (!totalDonated || totalDonated <= 0) return

    // --- CALCUL DE LA COMMISSION ADMIN (8%) ---
    const adminCommissionRate = 0.08
    const adminFee = totalDonated * adminCommissionRate
    const netCreatorAmount = totalDonated - adminFee

    const newTotal = (creator.recolte_total || 0) + netCreatorAmount

    const { error } = await supabase
      .from('creators')
      .update({ recolte_total: parseFloat(newTotal.toFixed(2)) })
      .eq('id', creator.id)

    if (!error) {
      setCreator({ ...creator, recolte_total: parseFloat(newTotal.toFixed(2)) })

      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      })

      setSuccessMessage(`Merci ! Don de ${totalDonated} ${currency} effectué (Frais admin 8%: ${adminFee.toFixed(2)} ${currency}) 🎉`)
      setTimeout(() => {
        setShowDonateModal(false)
        setSuccessMessage('')
        setCustomAmount('')
        setPhoneNumber('')
        setIsCustom(false)
      }, 4500)
    } else {
      alert("Erreur lors de l'enregistrement du don.")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <p className="text-lg animate-pulse">Chargement du profil...</p>
      </div>
    )
  }

  if (!creator) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-2">Créateur introuvable</h1>
        <p className="text-slate-400">Aucun profil ne correspond à cet utilisateur.</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-900 text-white p-6 flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-2xl text-center">
        <h1 className="text-3xl font-bold mb-2">{creator.nom_affichage}</h1>
        <p className="text-slate-300 mb-6">{creator.description}</p>

        <div className="bg-slate-700/50 p-4 rounded-xl mb-6 border border-slate-600">
          <p className="text-sm text-slate-400 mb-1">Objectif de collecte</p>
          <p className="text-2xl font-bold text-green-400">
            ${creator.recolte_total || 0} / ${creator.objectif} USD
          </p>
        </div>

        <button
          onClick={() => setShowDonateModal(true)}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-blue-600/30"
        >
          Faire un don à @{creator.username}
        </button>
      </div>

      {showDonateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowDonateModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl font-bold bg-slate-700/50 w-8 h-8 rounded-full flex items-center justify-center"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-4 text-center">Soutenir @{creator.username}</h2>

            {successMessage ? (
              <div className="bg-green-600/20 border border-green-500 text-green-300 p-4 rounded-xl text-center font-medium my-4">
                {successMessage}
              </div>
            ) : (
              <form onSubmit={handleDonate} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-2 font-medium">Sélectionnez un montant :</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['0.10', '0.50', '1'].map((val) => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => { setIsCustom(false); setAmount(val); }}
                        className={`py-2 px-2 rounded-xl font-bold border transition-all ${
                          !isCustom && amount === val
                            ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                            : 'bg-slate-700/60 border-slate-600 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        ${val}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setIsCustom(true)}
                      className={`py-2 px-2 rounded-xl font-bold border transition-all flex items-center justify-center ${
                        isCustom
                          ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                          : 'bg-slate-700/60 border-slate-600 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      + Perso
                    </button>
                  </div>
                </div>

                {isCustom && (
                  <div>
                    <label className="block text-sm text-slate-300 mb-1 font-medium">Montant personnalisé :</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="Ex: 5 ou 10"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm text-slate-300 mb-1 font-medium">Devise :</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="CDF">CDF (Franc Congolais)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="USDT">USDT (Crypto)</option>
                    <option value="XOF">XOF (Franc CFA)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-1 font-medium">Opérateur de Paiement :</label>
                  <select
                    value={operator}
                    onChange={(e) => setOperator(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="M-Pesa">M-Pesa</option>
                    <option value="Airtel Money">Airtel Money</option>
                    <option value="Orange Money">Orange Money</option>
                    <option value="Wave">Wave</option>
                    <option value="MTN Mobile Money">MTN Mobile Money</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-1 font-medium">Numéro de téléphone (pour le débit) :</label>
                  <input
                    type="tel"
                    placeholder="Ex: +243XXXXXXXXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-1 font-medium">Votre nom ou pseudo (optionnel) :</label>
                  <input
                    type="text"
                    placeholder="Ex: Anonyme"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-green-600/30 mt-2"
                >
                  Valider et envoyer le don 🚀
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
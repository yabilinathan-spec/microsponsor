'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  // Profil créateur synchronisé
  const [nomCreateur, setNomCreateur] = useState('Muzane');
  const [description, setDescription] = useState('Aidez-moi à financer mon nouveau matériel de création vidéo !');
  const [photoUrl, setPhotoUrl] = useState('https://via.placeholder.com/150');
  const [objectif, setObjectif] = useState(500);

  // Finances & Dons
  const [recolteTotal, setRecolteTotal] = useState(0);
  const [montantPersonnalise, setMontantPersonnalise] = useState('');
  const [devise, setDevise] = useState('USD');
  const [methodePaiement, setMethodePaiement] = useState('mpesa');
  const [numeroTelephone, setNumeroTelephone] = useState('');
  const [donateurNom, setDonateurNom] = useState('');
  const [donateurMessage, setDonateurMessage] = useState('');
  const [donneurs, setDonneurs] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Charger les données synchronisées au démarrage
  useEffect(() => {
    const savedNom = localStorage.getItem('ms_nom_createur');
    if (savedNom) setNomCreateur(savedNom);

    const savedDesc = localStorage.getItem('ms_desc_createur');
    if (savedDesc) setDescription(savedDesc);

    const savedPhoto = localStorage.getItem('ms_photo_createur');
    if (savedPhoto) setPhotoUrl(savedPhoto);

    const savedObj = localStorage.getItem('ms_objectif');
    if (savedObj) setObjectif(parseFloat(savedObj));

    const savedRecolte = localStorage.getItem('ms_recolte');
    if (savedRecolte) setRecolteTotal(parseFloat(savedRecolte));

    const savedDonneurs = localStorage.getItem('ms_donneurs');
    if (savedDonneurs) setDonneurs(JSON.parse(savedDonneurs));
  }, []);

  // Fonction pour effectuer le don
  const executerDon = (montantUSD) => {
    setIsProcessing(true);

    setTimeout(() => {
      const nouveauTotal = recolteTotal + montantUSD;
      setRecolteTotal(nouveauTotal);
      localStorage.setItem('ms_recolte', nouveauTotal.toString());

      // Ajout au classement des donateurs
      const nouveauDon = {
        nom: donateurNom.trim() || 'Soutien Anonyme',
        montantUSD: montantUSD,
        message: donateurMessage.trim() || 'Soutien via Mobile Money 🚀',
        date: new Date().toLocaleDateString()
      };

      const listeAjour = [...donneurs, nouveauDon].sort((a, b) => b.montantUSD - a.montantUSD);
      setDonneurs(listeAjour);
      localStorage.setItem('ms_donneurs', JSON.stringify(listeAjour));

      setDonateurNom('');
      setDonateurMessage('');
      setMontantPersonnalise('');
      setNumeroTelephone('');
      setIsProcessing(false);
      alert(`Merci ! Don de ${montantUSD.toFixed(2)} $ bien enregistré.`);
    }, 800);
  };

  // Soumission du montant personnalisé
  const soumettreDonPersonnalise = (e) => {
    e.preventDefault();
    const montantSaisi = parseFloat(montantPersonnalise);
    if (!montantSaisi || montantSaisi <= 0) return;

    // Taux de conversion approximatifs vers USD
    let montantUSD = montantSaisi;
    if (devise === 'CDF') montantUSD = montantSaisi / 2800;
    if (devise === 'XOF') montantUSD = montantSaisi / 600;
    if (devise === 'KES') montantUSD = montantSaisi / 130;
    if (devise === 'NGN') montantUSD = montantSaisi / 1500;

    executerDon(montantUSD);
  };

  const pourcentageAtteint = Math.min(100, (recolteTotal / objectif) * 100);

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 sm:p-6 max-w-2xl mx-auto space-y-6">
      
      {/* En-tête Navigation */}
      <div className="flex justify-between items-center bg-slate-900 p-4 rounded-3xl border border-slate-800">
        <h1 className="text-sm font-bold text-purple-400 uppercase tracking-wider">MicroSponsor</h1>
        <Link 
          href="/dashboard" 
          className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 px-4 rounded-xl border border-slate-700 font-semibold transition-all"
        >
          Espace Créateur ⚙️
        </Link>
      </div>

      {/* Profil Créateur Synchronisé */}
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center space-x-4">
          <img 
            src={photoUrl} 
            alt="Profil" 
            className="w-20 h-20 rounded-2xl object-cover border-2 border-purple-500/50 shadow-md"
            onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
          />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">{nomCreateur}</h2>
            <p className="text-xs text-slate-400 mt-1">{description}</p>
          </div>
        </div>

        {/* Barre de progression de la cagnotte */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-400">Objectif du mois</span>
            <span className="text-purple-400">{recolteTotal.toFixed(2)} $ / {objectif} $</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
            <div 
              className="bg-gradient-to-r from-purple-600 to-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${pourcentageAtteint}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Section Dons & Mobile Money */}
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400 text-center">
          Soutenir le créateur (Mobile Money)
        </h3>

        {/* Champs informations donateur */}
        <div className="space-y-2">
          <input 
            type="text" 
            placeholder="Votre nom ou pseudo (optionnel)"
            value={donateurNom}
            onChange={(e) => setDonateurNom(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
          />
          <input 
            type="text" 
            placeholder="Un petit message d'encouragement ?"
            value={donateurMessage}
            onChange={(e) => setDonateurMessage(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* 1. Boutons de dons rapides en 1 Clic */}
        <div className="space-y-2 pt-2">
          <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-bold">Dons rapides en 1 clic</label>
          <div className="grid grid-cols-3 gap-3">
            <button 
              onClick={() => executerDon(0.10)}
              disabled={isProcessing}
              className="bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/50 text-emerald-400 font-bold py-3 rounded-2xl text-xs transition-all cursor-pointer active:scale-95"
            >
              ⚡ 0,10 $
            </button>
            <button 
              onClick={() => executerDon(0.50)}
              disabled={isProcessing}
              className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 text-blue-400 font-bold py-3 rounded-2xl text-xs transition-all cursor-pointer active:scale-95"
            >
              🔥 0,50 $
            </button>
            <button 
              onClick={() => executerDon(1.00)}
              disabled={isProcessing}
              className="bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 text-purple-400 font-bold py-3 rounded-2xl text-xs transition-all cursor-pointer active:scale-95"
            >
              ⭐ 1,00 $
            </button>
          </div>
        </div>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-4 text-slate-500 text-[10px] uppercase font-bold">ou montant personnalisé</span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {/* 2. Formulaire de Don Personnalisé */}
        <form onSubmit={soumettreDonPersonnalise} className="space-y-3">
          
          {/* Sélection Devise (USD, CDF, XOF, KES, NGN) */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Devise</label>
            <div className="grid grid-cols-5 gap-1.5">
              {['USD', 'CDF', 'XOF', 'KES', 'NGN'].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDevise(d)}
                  className={`py-2 text-[11px] font-bold rounded-xl border transition-all ${
                    devise === d 
                      ? 'bg-purple-600 border-purple-500 text-white' 
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Montant ({devise})</label>
            <input 
              type="number" 
              step="any"
              min="1"
              placeholder="Ex: 5"
              value={montantPersonnalise}
              onChange={(e) => setMontantPersonnalise(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
            />
          </div>

          {/* Opérateur Mobile Money (Inclus MTN) */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Opérateur Mobile Money</label>
            <select 
              value={methodePaiement}
              onChange={(e) => setMethodePaiement(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value="mpesa">M-Pesa</option>
              <option value="orange">Orange Money</option>
              <option value="airtel">Airtel Money</option>
              <option value="mtn">MTN Mobile Money</option>
              <option value="wave">Wave</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Numéro de téléphone</label>
            <input 
              type="tel" 
              placeholder="+243..."
              value={numeroTelephone}
              onChange={(e) => setNumeroTelephone(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <button 
            type="submit"
            disabled={isProcessing || !montantPersonnalise}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 text-white font-bold py-3.5 rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-purple-600/20 disabled:opacity-50"
          >
            {isProcessing ? 'Traitement en cours...' : 'Envoyer le don personnalisé 🚀'}
          </button>
        </form>

      </div>

      {/* Leaderboard des donateurs */}
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400">Top Donateurs 🔥</h3>
        
        {donneurs.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">Soyez le premier à soutenir ce créateur !</p>
        ) : (
          <div className="space-y-2">
            {donneurs.slice(0, 5).map((d, index) => (
              <div key={index} className="flex justify-between items-center bg-slate-950 p-3 rounded-2xl border border-slate-800/60">
                <div>
                  <p className="text-xs font-bold text-white">
                    {index === 0 ? '🥇 ' : index === 1 ? '🥈 ' : index === 2 ? '🥉 ' : ''}{d.nom}
                  </p>
                  {d.message && <p className="text-[11px] text-slate-400 italic mt-0.5">"{d.message}"</p>}
                </div>
                <span className="text-xs font-bold text-purple-400">+{d.montantUSD.toFixed(2)} $</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </main>
  );
}
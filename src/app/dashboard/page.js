'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Inscription() {
  const router = useRouter()
  const [nom, setNom] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')

    const clean = username.toLowerCase().trim()
    if (!/^[a-z0-9_-]{3,30}$/.test(clean)) {
      setError("Le nom d'utilisateur doit faire 3 à 30 caractères : lettres, chiffres, _ ou -.")
      return
    }
    if (password.length < 6) {
      setError('Le mot de passe doit faire au moins 6 caractères.')
      return
    }

    setLoading(true)

    const { data: existing } = await supabase
      .from('creators')
      .select('id')
      .eq('username', clean)
      .maybeSingle()

    if (existing) {
      setError("Ce nom d'utilisateur est déjà pris.")
      setLoading(false)
      return
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    })

    if (signUpError || !data.user) {
      setError(signUpError?.message || "Impossible de créer le compte.")
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase.from('creators').insert({
      username: clean,
      nom_affichage: nom.trim() || clean,
      user_id: data.user.id,
    })

    if (insertError) {
      setError('Compte créé mais profil non enregistré : ' + insertError.message)
      setLoading(false)
      return
    }

    if (data.session) {
      router.push('/dashboard')
    } else {
      setInfo('Compte créé ! Vérifie ta boîte mail pour confirmer ton adresse, puis connecte-toi.')
    }
    setLoading(false)
  }

  const input =
    'w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500'

  return (
    <main className="min-h-screen bg-[#0b1020] text-white flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl shadow-2xl max-w-md w-full">
        <Link href="/" className="block text-center text-purple-400 font-extrabold tracking-wide mb-4">
          MICROSPONSOR
        </Link>
        <h1 className="text-2xl font-bold mb-1 text-center">Devenir créateur</h1>
        <p className="text-slate-400 text-sm mb-6 text-center">Crée ta page et reçois des dons dès aujourd’hui.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input className={input} placeholder="Nom affiché (ex : Muzane)" value={nom} onChange={(e) => setNom(e.target.value)} required />
          <div>
            <input className={input} placeholder="Nom d'utilisateur (ex : muzane)" value={username} onChange={(e) => setUsername(e.target.value)} required />
            <p className="text-xs text-slate-500 mt-1">
              Ton lien sera : /{username.toLowerCase().trim() || 'ton-nom'}
            </p>
          </div>
          <input className={input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className={input} type="password" placeholder="Mot de passe (6 caractères minimum)" value={password} onChange={(e) => setPassword(e.target.value)} required />

          {error && <p className="text-red-400 text-sm">{error}</p>}
          {info && <p className="text-green-400 text-sm">{info}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-purple-600/30"
          >
            {loading ? 'Création…' : 'Créer mon compte'}
          </button>
        </form>

        <p className="text-sm text-slate-400 text-center mt-6">
          Déjà un compte ?{' '}
          <Link href="/connexion" className="text-purple-400 font-semibold">Se connecter</Link>
        </p>
      </div>
    </main>
  )
}
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Connexion() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (signInError) {
      setError('Email ou mot de passe incorrect.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  const input =
    'w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500'

  return (
    <main className="min-h-screen bg-[#0b1020] text-white flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl shadow-2xl max-w-md w-full">
        <Link href="/" className="block text-center text-purple-400 font-extrabold tracking-wide mb-4">
          MICROSPONSOR
        </Link>
        <h1 className="text-2xl font-bold mb-6 text-center">Espace Créateur</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input className={input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className={input} type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required />

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-purple-600/30"
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <p className="text-sm text-slate-400 text-center mt-6">
          Pas encore de compte ?{' '}
          <Link href="/inscription" className="text-purple-400 font-semibold">Devenir créateur</Link>
        </p>
      </div>
    </main>
  )
}
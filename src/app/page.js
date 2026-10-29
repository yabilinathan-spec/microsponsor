'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [stats, setStats] = useState({ totalBrut: 0, commissionAdmin: 0, totalCreateurs: 0 })
  const router = useRouter()

  useEffect(() => {
    async function checkAdminAndLoadData() {
      const { data: { user } } = await supabase.auth.getUser()

      // Protection stricte par votre email
      if (!user || user.email !== 'yabilinathan813@gmail.com') {
        router.push('/dashboard')
        return
      }

      setIsAdmin(true)

      const { data: donations, error } = await supabase
        .from('donations')
        .select('amount')

      if (!error && donations) {
        const totalBrut = donations.reduce((acc, curr) => acc + Number(curr.amount || 0), 0)
        const commissionAdmin = totalBrut * 0.08
        const totalCreateurs = totalBrut - commissionAdmin

        setStats({ totalBrut, commissionAdmin, totalCreateurs })
      }

      setLoading(false)
    }

    checkAdminAndLoadData()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-gray-400">Vérification de l'accès admin...</p>
      </div>
    )
  }

  if (!isAdmin) return null

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-purple-400">Panneau Admin - MicroSponsor</h1>
          <p className="text-gray-400 text-sm mt-1">Espace confidentiel réservé à l'administrateur</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
            <p className="text-sm font-medium text-gray-400">Volume total des dons</p>
            <p className="text-3xl font-bold text-white mt-2">${stats.totalBrut.toFixed(2)}</p>
          </div>

          <div className="bg-purple-950/40 p-6 rounded-2xl border border-purple-500/30">
            <p className="text-sm font-medium text-purple-300">Ma commission (8 %)</p>
            <p className="text-3xl font-bold text-purple-400 mt-2">${stats.commissionAdmin.toFixed(2)}</p>
          </div>

          <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
            <p className="text-sm font-medium text-gray-400">Reversé aux créateurs</p>
            <p className="text-3xl font-bold text-green-400 mt-2">${stats.totalCreateurs.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
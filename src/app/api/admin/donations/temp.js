import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(req) {
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) {
    return NextResponse.json({ error: 'Non connecté.' }, { status: 401 })
  }

  // Vérifie le jeton auprès de Supabase (impossible à falsifier côté navigateur)
  const { data, error } = await supabaseAdmin.auth.getUser(token)
  const user = data?.user
  if (error || !user) {
    return NextResponse.json({ error: 'Session invalide.' }, { status: 401 })
  }

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const isAdmin =
    !!adminEmail &&
    user.email?.toLowerCase() === adminEmail &&
    !!user.email_confirmed_at

  if (!isAdmin) {
    return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 })
  }

  const { data: donations, error: dbErr } = await supabaseAdmin
    .from('donations')
    .select('*, creators(nom_affichage, username)')
    .order('created_at', { ascending: false })

  if (dbErr) {
    return NextResponse.json({ error: 'Erreur de lecture.' }, { status: 500 })
  }

  return NextResponse.json({ donations: donations || [] })
}
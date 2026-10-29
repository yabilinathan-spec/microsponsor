import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const COMMISSION_RATE = 0.08;
const CURRENCIES = ["USD", "CDF", "EUR", "USDT", "XOF"];

// Test rapide dans le navigateur : /api/donate
export async function GET() {
  return NextResponse.json({ ok: true, message: "Route /api/donate active" });
}

export async function POST(request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      return NextResponse.json(
        { error: "Configuration serveur manquante (variables Supabase)" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const username = String(body.username || "").trim();
    const amount = Number(body.amount);
    const currency = String(body.currency || "USD").toUpperCase();
    const phone = String(body.phone || "").replace(/\s+/g, "");

    if (!username) {
      return NextResponse.json({ error: "Créateur manquant" }, { status: 400 });
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Montant invalide" }, { status: 400 });
    }
    if (!CURRENCIES.includes(currency)) {
      return NextResponse.json({ error: "Devise non supportée" }, { status: 400 });
    }
    if (!/^\+?\d{8,15}$/.test(phone)) {
      return NextResponse.json({ error: "Numéro de téléphone invalide" }, { status: 400 });
    }

    const commission = Math.round(amount * COMMISSION_RATE * 100) / 100;
    const net_amount = Math.round((amount - commission) * 100) / 100;

    const supabase = createClient(url, key);

    const { data, error } = await supabase
      .from("donations")
      .insert({
        creator_username: username,
        amount,
        currency,
        phone,
        commission,
        net_amount,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, donation: data });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Erreur serveur" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";

const CURRENCIES = ["USD", "CDF", "XOF", "EUR", "KES", "GHS"];

// Test rapide dans le navigateur : /api/pay
export async function GET() {
  return NextResponse.json({ ok: true, message: "Route /api/pay active" });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const amount = Number(body.amount);
    const currency = String(body.currency || "").toUpperCase();
    const phone = String(body.phone || "").replace(/\s+/g, "");
    const operator = String(body.operator || "").trim();
    const creator = String(body.creator || "").trim();

    if (!creator) {
      return NextResponse.json(
        { success: false, message: "Créateur manquant" },
        { status: 400 }
      );
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, message: "Montant invalide" },
        { status: 400 }
      );
    }
    if (!CURRENCIES.includes(currency)) {
      return NextResponse.json(
        { success: false, message: "Devise non supportée" },
        { status: 400 }
      );
    }
    if (!/^\+?\d{8,15}$/.test(phone)) {
      return NextResponse.json(
        { success: false, message: "Numéro de téléphone invalide" },
        { status: 400 }
      );
    }
    if (!operator) {
      return NextResponse.json(
        { success: false, message: "Opérateur manquant" },
        { status: 400 }
      );
    }

    // ------------------------------------------------------------
    // ICI : brancher le vrai prestataire Mobile Money
    // (FlexPay, CinetPay, etc.) pour envoyer la demande de paiement
    // au téléphone du donateur.
    // Pour l'instant, la route valide les données et répond "succès".
    // ------------------------------------------------------------

    return NextResponse.json({
      success: true,
      message: "Demande de paiement enregistrée",
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, message: e.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

// Par défaut : sandbox (faux argent). Pour la production, définir
// PAWAPAY_BASE_URL=https://api.pawapay.io dans les variables Vercel.
const BASE_URL = process.env.PAWAPAY_BASE_URL || "https://api.sandbox.pawapay.io";

// Opérateurs de la RDC (identifiants pawaPay)
const PROVIDERS_RDC = {
  "M-Pesa": "VODACOM_MPESA_COD",
  "Airtel Money": "AIRTEL_COD",
  "Orange Money": "ORANGE_COD",
};
const DEVISES_RDC = ["USD", "CDF"];

// Test rapide dans le navigateur : /api/pay
export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Route /api/pay active (pawaPay)",
    tokenConfigure: Boolean(process.env.PAWAPAY_API_TOKEN),
    environnement: BASE_URL.includes("sandbox") ? "sandbox" : "production",
  });
}

// Met le numéro au format attendu : 243XXXXXXXXX (sans + ni espaces)
function normaliserNumeroRDC(brut) {
  const chiffres = String(brut || "").replace(/\D/g, "");
  if (chiffres.startsWith("243") && chiffres.length === 12) return chiffres;
  if (chiffres.startsWith("0") && chiffres.length === 10) return "243" + chiffres.slice(1);
  if (chiffres.length === 9) return "243" + chiffres;
  return null;
}

function messageClient(failureCode) {
  switch (failureCode) {
    case "AMOUNT_OUT_OF_BOUNDS":
      return "Montant trop petit ou trop grand pour cet opérateur.";
    case "PROVIDER_TEMPORARILY_UNAVAILABLE":
      return "Cet opérateur est momentanément indisponible. Réessaie plus tard.";
    case "INVALID_PHONE_NUMBER":
      return "Numéro de téléphone invalide pour cet opérateur.";
    case "INVALID_CURRENCY":
      return "Devise non acceptée par cet opérateur.";
    default:
      return "Le paiement a été refusé. Vérifie les informations et réessaie.";
  }
}

export async function POST(request) {
  try {
    const token = process.env.PAWAPAY_API_TOKEN;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Configuration serveur manquante (jeton pawaPay)" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const currency = String(body.currency || "").toUpperCase();
    const operator = String(body.operator || "").trim();
    const creator = String(body.creator || "").trim();
    const amountNum = Number(body.amount);

    if (!creator) {
      return NextResponse.json({ success: false, message: "Créateur manquant" }, { status: 400 });
    }
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      return NextResponse.json({ success: false, message: "Montant invalide" }, { status: 400 });
    }

    const provider = PROVIDERS_RDC[operator];
    if (!provider) {
      return NextResponse.json(
        { success: false, message: "Opérateur non disponible pour le moment (RDC uniquement : M-Pesa, Airtel Money, Orange Money)." },
        { status: 400 }
      );
    }
    if (!DEVISES_RDC.includes(currency)) {
      return NextResponse.json(
        { success: false, message: "Pour la RDC, choisis USD ou CDF." },
        { status: 400 }
      );
    }

    const phoneNumber = normaliserNumeroRDC(body.phone);
    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, message: "Numéro invalide. Exemple : +243810000000 ou 0810000000" },
        { status: 400 }
      );
    }

    // CDF : pas de décimales. USD : 2 décimales maximum.
    const amount = currency === "CDF" ? String(Math.round(amountNum)) : amountNum.toFixed(2);

    const depositId = randomUUID();

    const res = await fetch(`${BASE_URL}/v2/deposits`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        depositId,
        amount,
        currency,
        payer: {
          type: "MMO",
          accountDetails: { phoneNumber, provider },
        },
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (data.status === "ACCEPTED") {
      return NextResponse.json({
        success: true,
        depositId,
        message: "Demande envoyée. Valide le paiement sur ton téléphone.",
      });
    }

    if (data.status === "REJECTED") {
      console.error("pawaPay rejet:", JSON.stringify(data.failureReason));
      return NextResponse.json(
        { success: false, message: messageClient(data.failureReason?.failureCode) },
        { status: 400 }
      );
    }

    console.error("pawaPay réponse inattendue:", res.status, JSON.stringify(data));
    return NextResponse.json(
      { success: false, message: "Réponse inattendue du service de paiement. Réessaie." },
      { status: 502 }
    );
  } catch (e) {
    console.error("Erreur /api/pay:", e);
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 }
    );
  }
}
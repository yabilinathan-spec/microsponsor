import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0b1020] text-white">
      <header className="max-w-3xl mx-auto flex items-center justify-between p-6">
        <span className="text-xl font-extrabold tracking-wide text-purple-400">MICROSPONSOR</span>
        <Link
          href="/connexion"
          className="text-sm font-semibold border border-slate-700 bg-slate-800/60 hover:bg-slate-700 px-4 py-2 rounded-xl transition"
        >
          Espace Créateur
        </Link>
      </header>

      <section className="max-w-3xl mx-auto px-6 pt-10 pb-16 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
          Soutenez vos créateurs préférés,<br />
          <span className="text-purple-400">dès 0,10 $</span>
        </h1>
        <p className="mt-5 text-slate-400 text-lg">
          Une vidéo vous a plu ? Un clic, un petit don par mobile money, et le créateur est encouragé.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/inscription"
            className="bg-purple-600 hover:bg-purple-500 font-bold px-6 py-3 rounded-xl shadow-lg shadow-purple-600/30 transition"
          >
            Devenir créateur
          </Link>
          <Link
            href="/connexion"
            className="border border-slate-700 hover:bg-slate-800 font-semibold px-6 py-3 rounded-xl transition"
          >
            Se connecter
          </Link>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-20 grid gap-4 sm:grid-cols-3">
        {[
          ['1', 'Créez votre page', 'Choisissez votre nom d’utilisateur et personnalisez votre profil.'],
          ['2', 'Partagez votre lien', 'Mettez le lien dans votre bio et continuez à publier.'],
          ['3', 'Recevez des dons', 'Vos fans donnent en un clic via M-Pesa, Airtel Money, Orange Money, Wave ou MTN.'],
        ].map(([n, title, text]) => (
          <div key={n} className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center font-bold mb-3">{n}</div>
            <h3 className="font-bold mb-1">{title}</h3>
            <p className="text-sm text-slate-400">{text}</p>
          </div>
        ))}
      </section>
    </main>
  )
}
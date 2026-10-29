import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-4xl font-bold text-purple-400">MicroSponsor</h1>
        <p className="text-gray-400">
          Soutenez vos créateurs préférés avec un micro-don dès 0,10 $.
        </p>

        <Link
          href="/dashboard"
          className="block w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 rounded-xl"
        >
          Espace créateur
        </Link>
      </div>
    </div>
  )
}
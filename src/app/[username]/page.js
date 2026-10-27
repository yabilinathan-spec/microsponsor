import { Suspense } from 'react'
import CreatorClient from './creatorclient'

async function Content({ params }) {
  const { username } = await params
  return (
    <CreatorClient
      username={decodeURIComponent(username).toLowerCase().trim()}
    />
  )
}

export default function Page({ params }) {
  return (
    <Suspense fallback={<div>Chargement…</div>}>
      <Content params={params} />
    </Suspense>
  )
}
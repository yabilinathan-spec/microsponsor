export const dynamic = 'force-dynamic'; // <--- Ajoutez cette ligne

import CreatorClient from './creatorclient'

export default async function Page({ params }) {
  const { username } = await params
  return (
    <CreatorClient 
      username={(decodeURIComponent(username).toLowerCase().trim())}
    />
  )
}
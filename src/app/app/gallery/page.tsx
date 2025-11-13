import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { GalleryClient } from '@/components/gallery/gallery-client'

/**
 * Page de la Galerie Communautaire
 *
 * Responsabilité : Page serveur qui vérifie l'authentification
 * et rend le composant client de la galerie
 */
export default async function GalleryPage (): Promise<React.ReactElement> {
  const session = await auth.api.getSession({ headers: await headers() })

  if (session == null) {
    redirect('/sign-in')
  }

  return (
    <div className='min-h-screen'>
      <GalleryClient userId={session.user.id} />
    </div>
  )
}


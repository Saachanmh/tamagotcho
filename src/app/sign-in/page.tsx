import AuthFormContent from '@/components/forms/auth-form-content'
import { auth } from '@/lib/auth'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'

const COOKIE_NAME = 'better-auth.session'

/**
 * Page de connexion.
 * Redirige un utilisateur déjà authentifié vers /app.
 */
export default async function SignInPage (): Promise<React.ReactNode> {
    // Récupération asynchrone du store de cookies (typé Promise)
    const cookieStore = await cookies()
    if (cookieStore.get(COOKIE_NAME)) {
        redirect('/app')
    }

    // Fallback session via BetterAuth si pas de cookie (reconstruction Headers mutable)
    let session = null
    try {
        const readonlyHeaders = await headers()
        const h = new Headers()
        for (const [key, value] of readonlyHeaders) {
            h.set(key, value)
        }
        session = await auth.api.getSession({ headers: h })
    } catch {
        // Silencieux: si échec, on laisse afficher le formulaire
    }

    if (session) {
        redirect('/app')
    }

    return (
        <div className='min-h-screen bg-gradient-to-br from-moccaccino-50 via-fuchsia-blue-50 to-lochinvar-50 flex items-center justify-center p-4 relative overflow-hidden'>
            <div className='absolute inset-0 pointer-events-none overflow-hidden'>
                <div className='absolute top-20 left-10 text-6xl animate-bounce'>🥺</div>
                <div className='absolute top-32 right-20 text-5xl animate-pulse'>👾</div>
                <div className='absolute bottom-40 left-20 text-4xl animate-bounce' style={{ animationDelay: '1s' }}>🧸</div>
                <div className='absolute bottom-20 right-10 text-5xl animate-pulse' style={{ animationDelay: '2s' }}>🦄</div>
                <div className='absolute top-1/2 left-5 text-3xl animate-bounce' style={{ animationDelay: '0.5s' }}>🎀</div>
                <div className='absolute top-1/3 right-5 text-4xl animate-pulse' style={{ animationDelay: '1.5s' }}>🌟</div>
            </div>

            <div className='w-full max-w-md relative z-10'>
                <div className='bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-8 relative overflow-hidden'>
                    <div className='absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-moccaccino-400 via-fuchsia-blue-400 to-lochinvar-400' />
                    <div className='text-center mb-8'>
                        <div className='text-5xl mb-4'>🎮</div>
                        <h1 className='text-3xl font-bold bg-gradient-to-r from-moccaccino-600 to-fuchsia-blue-600 bg-clip-text text-transparent'>
                            Bienvenue chez Tamagotcho !
                        </h1>
                        <p className='text-gray-600 mt-2 text-sm'>
                            Vos petits monstres vous attendent 👹✨
                        </p>
                    </div>
                    <AuthFormContent />
                </div>
                <div className='text-center mt-6 text-gray-600 text-sm'>
                    <span className='italic'>&quot;Un monstre par jour éloigne l&apos;ennui pour toujours !&quot;</span> 🎭
                </div>
            </div>
        </div>
    )
}

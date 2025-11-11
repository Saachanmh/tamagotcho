'use client'

import React, { useEffect } from 'react'
import Button from '@/components/button'
import { authClient } from '@/lib/auth-client'

interface SignInFormProps {
    onError?: (message: string) => void
}

export default function SignInForm ({ onError }: SignInFormProps): React.ReactNode {
    useEffect(() => {
        console.log('SignInForm mounted')
    }, [])

    const handleGitHubLogin = async (): Promise<void> => {
        try {
            await authClient.signIn.social({
                provider: 'github',
                callbackURL: process.env.NEXT_PUBLIC_APP_URL ?? '/'
            })
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Erreur lors de la connexion avec GitHub'
            onError?.(message)
        }
    }

    const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault()
        const form = new FormData(e.currentTarget)

        try {
            await authClient.signIn.email({
                email: form.get('email') as string,
                password: form.get('password') as string,
                callbackURL: process.env.NEXT_PUBLIC_APP_URL ?? '/'
            })
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Erreur lors de la connexion'
            onError?.(message)
        }
    }

    return (
        <div className='flex flex-col gap-4 max-w-md mx-auto p-6'>
            <Button variant='outline' size='lg' onClick={handleGitHubLogin}>
                Se connecter avec GitHub
            </Button>

            <div className='relative'>
                <div className='absolute inset-0 flex items-center'>
                    <span className='w-full border-t' />
                </div>
                <div className='relative flex justify-center text-xs uppercase'>
                    <span className='bg-white px-2 text-gray-500'>Ou</span>
                </div>
            </div>

            <form onSubmit={handleEmailLogin} className='flex flex-col gap-3'>
                <input
                    data-testid='signin-email'
                    type='email'
                    name='email'
                    placeholder='Email'
                    required
                    className='px-4 py-2 border border-gray-300 rounded bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lochinvar-300'
                />
                <input
                    data-testid='signin-password'
                    type='password'
                    name='password'
                    placeholder='Mot de passe'
                    required
                    className='px-4 py-2 border border-gray-300 rounded bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lochinvar-300'
                />
                <Button type='submit' variant='primary' size='lg'>
                    Se connecter
                </Button>
            </form>
        </div>
    )
}

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'

async function CheckoutSuccessPage (): Promise<React.ReactNode> {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (session === null || session === undefined) {
        redirect('/login')
    }

    // Optionnel: Vérifier le paiement avec Stripe ici
    // await verifyPayment(session.user.id)

    redirect('/app')
}

export default CheckoutSuccessPage

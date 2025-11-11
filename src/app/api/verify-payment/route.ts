import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import Wallet from '@/db/models/wallet.model'
import { pricingTable } from '@/config/pricing'
import { auth } from '@/lib/auth'

export const runtime = 'nodejs'

/**
 * Vérifie manuellement le paiement Stripe après redirection
 * Responsabilité : Synchroniser le wallet si le webhook n'a pas fonctionné
 */
export async function POST (req: Request): Promise<Response> {
    const session = await auth.api.getSession({ headers: req.headers })

    if (session == null) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId } = await req.json()

    if (typeof sessionId !== 'string') {
        return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
    }

    console.log('🔍 Verifying payment for session:', sessionId)

    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId)

    console.log('💳 Payment status:', checkoutSession.payment_status)

    if (checkoutSession.payment_status !== 'paid') {
        return NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
    }

    const userId = checkoutSession.metadata?.userId
    const productId = checkoutSession.metadata?.productId

    console.log('👤 User ID:', userId)
    console.log('🛍️ Product ID:', productId)

    if (userId === undefined || productId === undefined) {
        return NextResponse.json({ error: 'Invalid metadata' }, { status: 400 })
    }

    const wallet = await Wallet.findOne({ ownerId: userId })

    if (wallet === null) {
        return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
    }

    const productEntry = Object.entries(pricingTable).find(
        ([_, pkg]) => pkg.productId === productId
    )

    if (productEntry === undefined) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const [koinsAmount] = productEntry
    const koinsToAdd = Number(koinsAmount)
    const previousBalance = Number(wallet.balance)

    wallet.balance = previousBalance + koinsToAdd
    wallet.markModified('balance')
    await wallet.save()

    console.log('✅ Payment verified and wallet updated')
    console.log(`💎 Koins added: ${koinsToAdd}`)
    console.log(`📊 Balance: ${previousBalance} → ${wallet.balance}`)

    return NextResponse.json({ success: true, koins: koinsToAdd })
}

import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import type Stripe from 'stripe'
import Wallet from '@/db/models/wallet.model'
import { pricingTable } from '@/config/pricing'

export const runtime = 'nodejs'

/**
 * Webhook Stripe pour traiter les événements de paiement
 * Responsabilité : Synchroniser les paiements Stripe avec le wallet utilisateur
 */
export async function POST (req: Request): Promise<Response> {
    const signature = (await headers()).get('stripe-signature')
    const payload = await req.text()

    if (signature === null) {
        console.error('❌ Missing Stripe signature')
        return new Response('Missing signature', { status: 400 })
    }

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(
            payload,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET as string
        )
    } catch (err: any) {
        console.error('❌ Webhook signature verification failed:', err.message)
        return new Response(`Webhook Error: ${err.message as string}`, { status: 400 })
    }

    console.log(`📬 Received Stripe event: ${event.type}`)

    switch (event.type) {
        case 'checkout.session.completed': {
            await handleCheckoutSessionCompleted(event)
            break
        }
        case 'payment_intent.succeeded': {
            console.log('💳 Payment intent succeeded:', event.data.object.id)
            // TODO: Implémenter la logique Payment Element si nécessaire
            break
        }
        default: {
            console.log(`⚠️ Unhandled event type: ${event.type}`)
        }
    }

    return new Response('ok', { status: 200 })
}

/**
 * Traite l'événement de session Checkout complétée
 * Met à jour le balance du wallet avec les Koins achetés
 */
async function handleCheckoutSessionCompleted (event: Stripe.Event): Promise<void> {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.userId
    const productId = session.metadata?.productId

    console.log('🎉 Checkout session completed')
    console.log('📦 Session ID:', session.id)
    console.log('👤 User ID:', userId)
    console.log('🛍️ Product ID:', productId)

    if (userId === undefined || userId === null) {
        console.error('❌ Missing userId in metadata')
        return
    }

    if (productId === undefined || productId === null) {
        console.error('❌ Missing productId in metadata')
        return
    }

    const wallet = await Wallet.findOne({ ownerId: userId })

    if (wallet === null || wallet === undefined) {
        console.error(`❌ Wallet not found for user: ${userId}`)
        return
    }

    console.log('💰 Wallet found:', wallet._id)

    const productEntry = Object.entries(pricingTable).find(
        ([_, pkg]) => pkg.productId === productId
    )

    if (productEntry === undefined) {
        console.error(`❌ Product not found in pricing table: ${productId}`)
        return
    }

    const [koinsAmount] = productEntry
    const koinsToAdd = Number(koinsAmount)
    const previousBalance = Number(wallet.balance)
    const newBalance = previousBalance + koinsToAdd

    wallet.balance = newBalance
    wallet.markModified('balance')
    await wallet.save()

    console.log(`✅ Wallet updated successfully`)
    console.log(`💎 Koins added: ${koinsToAdd}`)
    console.log(`📊 Balance: ${previousBalance} → ${newBalance}`)
}

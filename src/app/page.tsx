import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import HeaderWrapper from '@/components/header-wrapper'
import HeroSection from '@/components/hero-section'
import BenefitsSection from '@/components/benefits-section'
import MonstersSection from '@/components/monsters-section'
import ActionsSection from '@/components/actions-section'
import NewsletterSection from '@/components/newsletter-section'
import Footer from '@/components/footer'
import { Metadata } from 'next'

const COOKIE_NAME = 'better-auth.session'

export const metadata: Readonly<Metadata> = {
    title: 'Tamagotcho - Adopte et prends soin de ton compagnon virtuel',
    description: 'Tamagotcho est une application web où tu peux adopter, nourrir, jouer et faire évoluer ton propre monstre virtuel. Rejoins-nous pour une aventure amusante et interactive !',
    keywords: 'Tamagotcho, monstre virtuel, adoption, jeu, aventure',
    openGraph: {
        title: 'Tamagotcho - Adopte et prends soin de ton compagnon virtuel',
        description: 'Tamagotcho est une application web où tu peux adopter, nourrir, jouer et faire évoluer ton propre monstre virtuel. Rejoins-nous pour une aventure amusante et interactive !'
    },
    twitter: {
        title: 'Tamagotcho - Adopte et prends soin de ton compagnon virtuel',
        description: 'Tamagotcho est une application web où tu peux adopter, nourrir, jouer et faire évoluer ton propre monstre virtuel. Rejoins-nous pour une aventure amusante et interactive !'
    }
}

// Page d'accueil: redirection serveur si utilisateur déjà authentifié
export default async function Home (): Promise<React.ReactNode> {
    const cookieStore = await cookies()
    if (cookieStore.get(COOKIE_NAME)) {
        redirect('/app')
    }

    return (
        <div className='font-sans'>
            <HeaderWrapper />
            <HeroSection />
            <BenefitsSection />
            <MonstersSection />
            <ActionsSection />
            <NewsletterSection />
            <Footer />
        </div>
    )
}

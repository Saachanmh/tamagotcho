import type { AccessoryType, AccessoryItem } from '@/components/monsters/pixel-monster'

export interface BackgroundItem {
    id: string
    type: 'background'
    name: string
    price: number
    description: string
    category: 'background'
    imageUrl: string
    owned?: boolean
}

export interface ShopItem extends AccessoryItem {
    name: string
    price: number
    description: string
    category: 'hat' | 'glasses' | 'footwear' | 'body'
    owned?: boolean
}

// Catalogue complet avec vos nouveaux accessoires
export const SHOP_CATALOG: ShopItem[] = [
    // Chapeaux
    { id: 'hat-red', type: 'hat', name: 'Chapeau Rouge', price: 150, color: '#e53e3e', category: 'hat', description: 'Un élégant chapeau rouge' },
    { id: 'hat-blue', type: 'hat', name: 'Chapeau Bleu', price: 180, color: '#3182ce', category: 'hat', description: 'Chapeau bleu océan' },
    { id: 'hat-purple', type: 'hat', name: 'Chapeau Violet', price: 200, color: '#805ad5', category: 'hat', description: 'Chapeau violet royal' },

    // Lunettes
    { id: 'glasses-black', type: 'glasses', name: 'Lunettes Noires', price: 100, color: '#2d3748', category: 'glasses', description: 'Lunettes de soleil stylées' },
    { id: 'glasses-gold', type: 'glasses', name: 'Lunettes Dorées', price: 250, color: '#d69e2e', category: 'glasses', description: 'Lunettes dorées de luxe' },
    { id: 'glasses-pink', type: 'glasses', name: 'Lunettes Roses', price: 120, color: '#ed64a6', category: 'glasses', description: 'Lunettes roses tendance' },

    // Chaussures classiques
    { id: 'shoes-red', type: 'shoes', name: 'Chaussures Rouges', price: 80, color: '#e53e3e', category: 'footwear', description: 'Chaussures classiques rouges' },
    { id: 'shoes-green', type: 'shoes', name: 'Chaussures Vertes', price: 85, color: '#38a169', category: 'footwear', description: 'Chaussures vertes écologiques' },
    { id: 'shoes-purple', type: 'shoes', name: 'Chaussures Violettes', price: 110, color: '#805ad5', category: 'footwear', description: 'Chaussures violettes chic' },

    // Vos nouveaux accessoires
    { id: 'sneakers-white', type: 'sneakers', name: 'Baskets Blanches', price: 95, color: '#ffffff', category: 'footwear', description: 'Baskets de sport blanches' },
    { id: 'sneakers-blue', type: 'sneakers', name: 'Baskets Bleues', price: 105, color: '#3182ce', category: 'footwear', description: 'Baskets sportives bleues' },

    { id: 'boots-brown', type: 'boots', name: 'Bottes Marron', price: 150, color: '#8b4513', category: 'footwear', description: 'Bottes robustes marron' },
    { id: 'boots-black', type: 'boots', name: 'Bottes Noires', price: 160, color: '#2d3748', category: 'footwear', description: 'Bottes noires élégantes' },

    { id: 'slippers-pink', type: 'slippers', name: 'Pantoufles Roses', price: 60, color: '#ed64a6', category: 'footwear', description: 'Pantoufles confortables roses' },
    { id: 'slippers-gray', type: 'slippers', name: 'Pantoufles Grises', price: 65, color: '#718096', category: 'footwear', description: 'Pantoufles douillettes grises' }
]

// Catalogue des backgrounds
export const BACKGROUND_CATALOG: BackgroundItem[] = [
    {
        id: 'bg-forest',
        type: 'background',
        name: 'Forêt Enchantée',
        price: 250,
        category: 'background',
        imageUrl: '/assets/Screenshot 2025-11-12 at 13-58-19 A whimsical forest scene with glowing lights and fantastical creatures Premium Photo.png',
        description: 'Une forêt magique avec des lumières scintillantes'
    },
    {
        id: 'bg-watercolor',
        type: 'background',
        name: 'Aquarelle Kawaii',
        price: 200,
        category: 'background',
        imageUrl: '/assets/pngtree-cartoon-cute-watercolor-background-image_2141603.jpg',
        description: 'Fond aquarelle coloré et mignon'
    },
    {
        id: 'bg-abstract',
        type: 'background',
        name: 'Abstrait Coloré',
        price: 220,
        category: 'background',
        imageUrl: '/assets/ba16333ff50edfda47a243bba6e1fe0b.jpg',
        description: 'Design abstrait vibrant et moderne'
    },
    {
        id: 'bg-pastel',
        type: 'background',
        name: 'Pastel Doux',
        price: 210,
        category: 'background',
        imageUrl: '/assets/istockphoto-1840438197-612x612.jpg',
        description: 'Fond pastel doux et apaisant'
    }
]

// État des accessoires équipés
type EquippedAccessories = Partial<Record<AccessoryType, AccessoryItem | null>>

const STORAGE_KEY = 'tamagotcho:equipped'
const OWNED_KEY = 'tamagotcho:owned'
const BACKGROUND_KEY = 'tamagotcho:background'
const OWNED_BACKGROUNDS_KEY = 'tamagotcho:owned-backgrounds'

let equipped: EquippedAccessories = loadEquipped()
let owned: Set<string> = loadOwned()
let equippedBackground: BackgroundItem | null = loadEquippedBackground()
let ownedBackgrounds: Set<string> = loadOwnedBackgrounds()

const listeners = new Set<(state: {
    equipped: EquippedAccessories
    owned: Set<string>
    background: BackgroundItem | null
    ownedBackgrounds: Set<string>
}) => void>()

function loadEquipped(): EquippedAccessories {
    try {
        const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
        return raw ? JSON.parse(raw) : {}
    } catch {
        return {}
    }
}

function loadOwned(): Set<string> {
    try {
        const raw = typeof window !== 'undefined' ? localStorage.getItem(OWNED_KEY) : null
        return new Set(raw ? JSON.parse(raw) : [])
    } catch {
        return new Set()
    }
}

// Ajout: loaders pour les backgrounds
function loadEquippedBackground(): BackgroundItem | null {
    try {
        const raw = typeof window !== 'undefined' ? localStorage.getItem(BACKGROUND_KEY) : null
        return raw ? JSON.parse(raw) : null
    } catch {
        return null
    }
}

function loadOwnedBackgrounds(): Set<string> {
    try {
        const raw = typeof window !== 'undefined' ? localStorage.getItem(OWNED_BACKGROUNDS_KEY) : null
        return new Set(raw ? JSON.parse(raw) : [])
    } catch {
        return new Set()
    }
}

function persist() {
    try {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(equipped))
            localStorage.setItem(OWNED_KEY, JSON.stringify([...owned]))
            // Ajout: persistance des backgrounds
            localStorage.setItem(BACKGROUND_KEY, JSON.stringify(equippedBackground))
            localStorage.setItem(OWNED_BACKGROUNDS_KEY, JSON.stringify([...ownedBackgrounds]))
        }
    } catch {}
}

function notify() {
    // Ajout: inclure background et ownedBackgrounds dans l'état notifié
    listeners.forEach((listener) => listener({
        equipped: { ...equipped },
        owned: new Set(owned),
        background: equippedBackground,
        ownedBackgrounds: new Set(ownedBackgrounds)
    }))
}

// Mise à jour: signature et valeur de retour de subscribeShop
export function subscribeShop(callback: (state: {
    equipped: EquippedAccessories
    owned: Set<string>
    background: BackgroundItem | null
    ownedBackgrounds: Set<string>
}) => void) {
    listeners.add(callback)
    callback({
        equipped: { ...equipped },
        owned: new Set(owned),
        background: equippedBackground,
        ownedBackgrounds: new Set(ownedBackgrounds)
    })
    return () => {
        listeners.delete(callback)
    }
}

export function getEquipped(): EquippedAccessories {
    return { ...equipped }
}

export function getOwned(): Set<string> {
    return new Set(owned)
}

export function getEquippedBackground(): BackgroundItem | null {
    return equippedBackground
}

export function getOwnedBackgrounds(): Set<string> {
    return new Set(ownedBackgrounds)
}

export async function buyAccessory(item: ShopItem): Promise<{ ok: boolean; error?: string }> {
    // Logique d'achat (ici simplified - pas de vérification de monnaie)
    if (owned.has(item.id)) {
        return { ok: false, error: 'Déjà possédé' }
    }

    owned.add(item.id)
    persist()
    notify()
    return { ok: true }
}

export async function buyBackground(item: BackgroundItem): Promise<{ ok: boolean; error?: string }> {
    if (ownedBackgrounds.has(item.id)) {
        return { ok: false, error: 'Déjà possédé' }
    }

    ownedBackgrounds.add(item.id)
    persist()
    notify()
    return { ok: true }
}

export function equipAccessory(item: AccessoryItem) {
    equipped = { ...equipped, [item.type]: item }
    persist()
    notify()
}

export function unequipAccessory(type: AccessoryType) {
    const copy = { ...equipped }
    copy[type] = null
    equipped = copy
    persist()
    notify()
}

export function equipBackground(item: BackgroundItem | null) {
    equippedBackground = item
    persist()
    notify()
}

export function getCatalogWithOwnership(): ShopItem[] {
    return SHOP_CATALOG.map(item => ({
        ...item,
        owned: owned.has(item.id)
    }))
}

export function getBackgroundCatalogWithOwnership(): BackgroundItem[] {
    return BACKGROUND_CATALOG.map(item => ({
        ...item,
        owned: ownedBackgrounds.has(item.id)
    }))
}

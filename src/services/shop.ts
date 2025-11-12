import type { AccessoryType, AccessoryItem } from '@/components/monsters/pixel-monster'

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

// État des accessoires équipés
type EquippedAccessories = Partial<Record<AccessoryType, AccessoryItem | null>>

const STORAGE_KEY = 'tamagotcho:equipped'
const OWNED_KEY = 'tamagotcho:owned'

let equipped: EquippedAccessories = loadEquipped()
let owned: Set<string> = loadOwned()

const listeners = new Set<(state: { equipped: EquippedAccessories; owned: Set<string> }) => void>()

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

function persist() {
    try {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(equipped))
            localStorage.setItem(OWNED_KEY, JSON.stringify([...owned]))
        }
    } catch {}
}

function notify() {
    listeners.forEach((listener) => listener({ equipped: { ...equipped }, owned: new Set(owned) }))
}

export function subscribeShop(callback: (state: { equipped: EquippedAccessories; owned: Set<string> }) => void) {
    listeners.add(callback)
    callback({ equipped: { ...equipped }, owned: new Set(owned) })
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

export function getCatalogWithOwnership(): ShopItem[] {
    return SHOP_CATALOG.map(item => ({
        ...item,
        owned: owned.has(item.id)
    }))
}

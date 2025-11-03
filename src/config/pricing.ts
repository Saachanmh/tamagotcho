/**
 * Table de tarification pour les packages de Koins
 *
 * Cette configuration est partagée entre le client et le serveur.
 * Elle définit les différents packages disponibles à l'achat.
 */

export interface PricingPackage {
  productId: string
  price: number
}

export const pricingTable: Record<number, PricingPackage> = {
  10: {
    productId: 'prod_TJrIjoHwTKwg9c',
    price: 0.5
  },
  50: {
    productId: 'prod_TJrJHiNKtOkEXR',
    price: 1
  },
  500: {
    productId: 'prod_TJrJT9hFwWozod',
    price: 2
  },
  1000: {
    productId: 'prod_TJrKh3jSiA5EQ5',
    price: 3
  },
  5000: {
    productId: 'prod_TJrLUfvqFCZx8l',
    price: 10
  }
}

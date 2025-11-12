// Centralise les montants de récompenses pour chaque action monstre
// Modifiez les valeurs ici sans toucher à la logique domaine
export const REWARD_AMOUNTS = {
  feed: 2,
  cuddle: 1,
  play: 2,
  clean: 1
} as const

export type RewardActionKey = keyof typeof REWARD_AMOUNTS

// Optionnel: export d'une liste typée (utile pour des UIs ou validations)
export const AVAILABLE_REWARD_ACTIONS: readonly RewardActionKey[] =
  Object.keys(REWARD_AMOUNTS) as readonly RewardActionKey[]


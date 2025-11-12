giimport { REWARD_AMOUNTS } from '@/config/rewards'

export type MonsterActionType = keyof typeof REWARD_AMOUNTS

/**
 * Retourne la récompense en koins pour une action.
 */
export function getRewardForAction (action: MonsterActionType): number {
    return REWARD_AMOUNTS[action] ?? 0
}

export const AVAILABLE_ACTIONS: readonly MonsterActionType[] =
  Object.keys(REWARD_AMOUNTS) as readonly MonsterActionType[]

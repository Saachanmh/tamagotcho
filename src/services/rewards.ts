export type MonsterActionType = 'feed' | 'cuddle' | 'play' | 'clean'

const ACTION_REWARDS: Record<MonsterActionType, number> = {
    feed: 2,
    cuddle: 1,
    play: 2,
    clean: 1
}

/**
 * Retourne la récompense en koins pour une action.
 */
export function getRewardForAction (action: MonsterActionType): number {
    return ACTION_REWARDS[action] ?? 0
}

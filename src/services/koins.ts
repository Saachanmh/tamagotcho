/**
 * Abstraction placeholder pour persistance.
 * À remplacer par un accès réel (Prisma, SQL, etc.).
 */
export async function incrementUserKoins (userId: string, delta: number): Promise<number> {
    // TODO: remplacer par un update transactionnel réel.
    // Exemple pseudo:
    // const user = await db.user.update({ where: { id: userId }, data: { koins: { increment: delta } } })
    // return user.koins
    console.warn('incrementUserKoins() est un placeholder.')
    return 0 + delta
}

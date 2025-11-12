import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getRewardForAction, type MonsterActionType } from '@/services/rewards'
import { incrementUserKoins } from '@/services/koins'

interface ActionBody {
    action: MonsterActionType
    monsterId: string
}

export async function POST (req: Request): Promise<Response> {
    try {
        const session = await auth.api.getSession({ headers: req.headers })
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
        }

        const body = (await req.json()) as ActionBody
        if (!body.action || !body.monsterId) {
            return NextResponse.json({ error: 'BAD_REQUEST' }, { status: 400 })
        }

        // Ici tu peux ajouter une validation: vérifier que le monstre appartient à l'utilisateur.
        const delta = getRewardForAction(body.action)
        const newBalance = await incrementUserKoins(session.user.id, delta)

        return NextResponse.json({
            success: true,
            delta,
            balance: newBalance
        })
    } catch (e) {
        return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
    }
}

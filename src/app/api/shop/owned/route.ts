import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { connectMongooseToDatabase } from '@/db'
import OwnedAccessory from '@/db/models/owned-accessory.model'
import OwnedBackground from '@/db/models/owned-background.model'

export const runtime = 'nodejs'

export async function GET (req: Request): Promise<Response> {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { user } = session

    await connectMongooseToDatabase()

    const { searchParams } = new URL(req.url)
    const monsterId = searchParams.get('monsterId') ?? undefined

    const query = monsterId ? { ownerId: user.id, monsterId } : { ownerId: user.id }

    const [accRows, bgRows] = await Promise.all([
      OwnedAccessory.find(query).lean().exec(),
      OwnedBackground.find(query).lean().exec()
    ])

    const accessories = accRows.map(r => r.itemId)
    const backgrounds = bgRows.map(r => r.itemId)

    return NextResponse.json({ accessories, backgrounds })
  } catch (e) {
    console.error('GET /api/shop/owned error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}


import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { updateMonsterPublicFlag } from '@/actions/monsters.actions'
import { revalidatePath } from 'next/cache'

export async function POST (req: Request): Promise<Response> {
  try {
    console.log('🔄 Toggle public request received')
    const session = await auth.api.getSession({ headers: req.headers })
    if (session == null) {
      console.log('❌ No session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.log('✅ Session found:', session.user.id)

    const body = await req.json() as { id?: string, isPublic?: boolean }
    console.log('📦 Request body:', body)

    if (typeof body.id !== 'string' || typeof body.isPublic !== 'boolean') {
      console.log('❌ Invalid payload')
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    console.log(`🔧 Updating monster ${body.id} to isPublic=${body.isPublic}`)
    const updated = await updateMonsterPublicFlag(session.user.id, body.id, body.isPublic)

    if (updated == null) {
      console.log('❌ Monster not found or update failed')
      return NextResponse.json({ error: 'Monster not found' }, { status: 404 })
    }

    console.log('✅ Monster updated:', { id: updated._id, isPublic: updated.isPublic })

    // Revalidate paths
    revalidatePath(`/app/creatures/${body.id}`)
    revalidatePath('/app')
    console.log('🔄 Paths revalidated')

    return NextResponse.json({ success: true, monster: updated })
  } catch (e) {
    console.error('❌ toggle-public error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

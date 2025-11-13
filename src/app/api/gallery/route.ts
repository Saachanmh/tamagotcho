import { NextResponse } from 'next/server'

/**
 * API route pour la galerie (alternative)
 *
 * Note: Cette route existe pour compatibilité mais n'est pas utilisée.
 * La galerie utilise les server actions directement (gallery.actions.ts)
 */
export async function GET (): Promise<NextResponse> {
  return NextResponse.json({
    message: 'Gallery API route - Not used. Use server actions instead.',
    status: 'ok'
  })
}


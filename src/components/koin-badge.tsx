'use client'
import React from 'react'
import { useKoins } from '@/context/koin-context'

export default function KoinBadge (): React.ReactNode {
    const { balance } = useKoins()
    return (
        <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-moccaccino-50 border border-moccaccino-200 text-moccaccino-600 text-sm'>
            <span>🪙</span>
            <span>{balance} koins</span>
        </div>
    )
}

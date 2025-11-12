'use client'
import React, { createContext, useContext, useState, useCallback } from 'react'

interface KoinContextValue {
    balance: number
    setBalance: (value: number) => void
    applyDelta: (delta: number) => void
}

const KoinContext = createContext<KoinContextValue | undefined>(undefined)

export function KoinProvider ({
                                  children,
                                  initialBalance = 0
                              }: {
    children: React.ReactNode
    initialBalance?: number
}): React.ReactNode {
    const [balance, setBalance] = useState<number>(initialBalance)
    const applyDelta = useCallback((delta: number) => {
        setBalance(prev => prev + delta)
    }, [])
    return (
        <KoinContext.Provider value={{ balance, setBalance, applyDelta }}>
            {children}
        </KoinContext.Provider>
    )
}

export function useKoins (): KoinContextValue {
    const ctx = useContext(KoinContext)
    if (!ctx) throw new Error('useKoins must be used inside KoinProvider')
    return ctx
}

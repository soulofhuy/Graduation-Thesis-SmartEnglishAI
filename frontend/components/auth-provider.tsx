'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { AuthUser } from '@/lib/types'

type AuthSession = {
    user: AuthUser
    accessToken?: string | null
    refreshToken?: string | null
}

type AuthContextType = {
    user: AuthUser | null
    isAuthenticated: boolean
    accessToken: string | null
    refreshToken: string | null
    isHydrated: boolean
    login: (session: AuthSession) => void
    logout: () => void
}

const AUTH_STORAGE_KEY = 'auth_session'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [accessToken, setAccessToken] = useState<string | null>(null)
    const [refreshToken, setRefreshToken] = useState<string | null>(null)
    const [isHydrated, setIsHydrated] = useState(false)

    useEffect(() => {
        const raw = localStorage.getItem(AUTH_STORAGE_KEY)
        if (raw) {
            try {
                const session = JSON.parse(raw) as AuthSession
                setUser(session.user)
                setAccessToken(session.accessToken ?? null)
                setRefreshToken(session.refreshToken ?? null)
            } catch {
                localStorage.removeItem(AUTH_STORAGE_KEY)
            }
        }
        setIsHydrated(true)
    }, [])

    const login = useCallback((session: AuthSession) => {
        setUser(session.user)
        setAccessToken(session.accessToken ?? null)
        setRefreshToken(session.refreshToken ?? null)
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
    }, [])

    const logout = useCallback(() => {
        setUser(null)
        setAccessToken(null)
        setRefreshToken(null)
        localStorage.removeItem(AUTH_STORAGE_KEY)
    }, [])

    const value = useMemo<AuthContextType>(
        () => ({
            user,
            isAuthenticated: Boolean(user),
            accessToken,
            refreshToken,
            isHydrated,
            login,
            logout,
        }),
        [user, accessToken, refreshToken, isHydrated, login, logout],
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}

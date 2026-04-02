'use client'

import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { LanguageProvider } from '@/components/language-provider'
import { ReactScan } from '@/components/react-scan'
import { AuthProvider } from '@/components/auth-provider'

export default function AppProviders({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <AuthProvider>
                <LanguageProvider>
                    <ReactScan />
                    {children}
                    <Toaster position="top-right" richColors />
                </LanguageProvider>
            </AuthProvider>
        </ThemeProvider>
    )
}

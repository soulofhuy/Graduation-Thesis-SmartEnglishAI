'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageToggle } from '@/components/language-toggle'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { requestPasswordReset, verifyPasswordResetOTP, resetPassword } from '@/services/auth'
import { toast } from 'sonner'
import { TOAST_COLORS } from '@/lib/toast/color'
import { useLanguage } from '@/components/language-provider'
import { getToastMessage } from '@/lib/toast/message'

type Step = 'email' | 'otp' | 'password'

export default function ForgotPasswordPage() {
    const { t, language } = useLanguage()

    const [isLoaded, setIsLoaded] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const [step, setStep] = useState<Step>('email')

    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [newPassword, setNewPassword] = useState('')

    useEffect(() => {
        setIsLoaded(true)
    }, [])

    async function handleSendOTP() {
        try {
            setIsLoading(true)
            await requestPasswordReset(email)
            toast.success('OTP has been sent to your email', { className: TOAST_COLORS.success })
            setStep('otp')
        } catch (error) {
            const message = error instanceof Error ? error.message : getToastMessage('error', language)
            toast.error(message, { className: TOAST_COLORS.error })
        } finally {
            setIsLoading(false)
        }
    }

    async function handleVerifyOTP() {
        try {
            setIsLoading(true)
            await verifyPasswordResetOTP(email, otp)
            toast.success('OTP verified successfully', { className: TOAST_COLORS.success })
            setStep('password')
        } catch (error) {
            const message = error instanceof Error ? error.message : 'OTP verification failed'
            toast.error(message, { className: TOAST_COLORS.error })
        } finally {
            setIsLoading(false)
        }
    }

    async function handleResetPassword() {
        try {
            setIsLoading(true)
            await resetPassword(email, newPassword)
            toast.success('Password updated successfully', { className: TOAST_COLORS.success })
            window.location.href = '/login'
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Password reset failed'
            toast.error(message, { className: TOAST_COLORS.error })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div
            className="min-h-screen bg-background text-foreground overflow-hidden"
            suppressHydrationWarning
        >
            <div className="relative min-h-screen flex flex-col">
                <div className="backdrop-blur-sm border-b border-border/70">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                        <Link
                            href="/login"
                            className="flex items-center gap-2 w-fit hover:opacity-70 transition-smooth text-foreground"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>

                        <div className="flex flex-1 justify-start ml-3">
                            <Image
                                src="/logo/langoer-logo.png"
                                alt="Langoer Logo"
                                width={150}
                                height={150}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <ThemeToggle />
                            <LanguageToggle />
                        </div>

                    </div>
                </div>

                <div className="mx-auto grid w-full max-w-7xl flex-1 px-4 sm:px-6 lg:grid-cols-[minmax(0,520px)_1fr] lg:px-8">

                    <div className="relative z-10 flex items-center py-12">
                        <div className={`w-full transition-all duration-700 ${isLoaded ? 'animate-scale-in' : 'opacity-0'}`}>
                            <div className="space-y-2">
                                <h1 className="text-lg font-semibold tracking-tight sm:text-4xl">
                                    {t.forgotPassword.title}
                                </h1>

                                <p className="text-sm text-muted-foreground">
                                    {t.forgotPassword.subtitle}
                                </p>
                            </div>

                            <Card className="mt-8 border border-border/70 bg-card/90 p-6">

                                {step === 'email' && (
                                    <div className="space-y-5">

                                        <Input
                                            type="email"
                                            placeholder={t.forgotPassword.emailPlaceholder}
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />

                                        <Button className="w-full" disabled={isLoading} onClick={handleSendOTP}>
                                            {isLoading ? t.common.loading : t.forgotPassword.sendOTPButton}
                                        </Button>

                                    </div>
                                )}

                                {step === 'otp' && (
                                    <div className="space-y-5">

                                        <Input
                                            placeholder={t.forgotPassword.otpPlaceholder}
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                        />

                                        <Button className="w-full" disabled={isLoading} onClick={handleVerifyOTP}>
                                            {isLoading ? t.common.loading : t.forgotPassword.verifyOTPButton}
                                        </Button>

                                    </div>
                                )}

                                {step === 'password' && (
                                    <div className="space-y-5">

                                        <Input
                                            type="password"
                                            placeholder={t.forgotPassword.newPasswordPlaceholder}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                        />

                                        <Button className="w-full" disabled={isLoading} onClick={handleResetPassword}>
                                            {isLoading ? t.common.loading : t.forgotPassword.resetPasswordButton}
                                        </Button>

                                    </div>
                                )}

                            </Card>
                        </div>
                    </div>

                    <div className="relative hidden lg:block">
                        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background" />
                        <div className="absolute -right-32 top-1/2 h-[620px] w-[620px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_30%_30%,#ff2d55_0%,#ff7a00_32%,#c300ff_64%,#7c3aed_100%)] blur-[60px] opacity-90 dark:opacity-60 animate-bubble-drift pointer-events-none" />
                    </div>

                </div>
            </div>
        </div>
    )
}
'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createSignupSchema, type SignupFormValues } from '@/lib/validators/signup'
import { getAuthValidationMessages } from '@/lib/validation-translators/auth'
import { registerUser } from '@/services/auth'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageToggle } from '@/components/language-toggle'
import { useLanguage } from '@/components/language-provider'
import { ArrowLeft, GraduationCap, Presentation, Eye, EyeOff } from 'lucide-react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import Image from 'next/image'
import { TOAST_COLORS } from '@/lib/toast/color'
import { getToastMessage } from '@/lib/toast/message'

export default function SignupPage() {
    const { t, language } = useLanguage()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [step, setStep] = useState<'role' | 'form'>('role')

    useEffect(() => {
        setIsLoaded(true)
    }, [])

    const signupSchema = useMemo(
        () => createSignupSchema(getAuthValidationMessages(language)),
        [language],
    )

    const form = useForm<SignupFormValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            role: 'student',
            email: '',
            password: '',
            confirmPassword: '',
        },
    })

    async function onSubmit(values: SignupFormValues) {
        setIsLoading(true)
        try {
            const { message } = await registerUser(values.email, values.password, values.role)
            if (message) {
                toast.success(getToastMessage('signUpSuccess', language), { className: TOAST_COLORS.success })
            }
            router.push('/login')
        } catch (error) {
            const message = error instanceof Error ? error.message : getToastMessage('signUpFailed', language)
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
                        <Link href="/" className="flex items-center gap-2 w-fit hover:opacity-70 transition-smooth text-foreground">
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
                    <div className="relative z-10 flex items-center py-6">
                        <div className={`w-full transition-all duration-700 ${isLoaded ? 'animate-scale-in' : 'opacity-0'}`}>
                            <div className="space-y-2">
                                <h1 className="text-lg font-semibold tracking-tight sm:text-4xl">{t.signup.title}</h1>
                                <p className="text-sm text-muted-foreground">{t.signup.subTitle}</p>
                            </div>

                            <Card className="mt-8 border border-border/70 bg-card/90 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
                                <div className="relative min-h-[260px]">
                                    <div
                                        className={`space-y-6 transition-all duration-500 ${step === 'role' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none absolute inset-0'}`}
                                    >
                                        <div className="space-y-2">
                                            <h2 className="text-base font-semibold">{t.signup.roleTitle}</h2>
                                            <p className="text-sm text-muted-foreground">{t.signup.roleHint}</p>
                                        </div>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    form.setValue('role', 'student', { shouldValidate: true })
                                                    setStep('form')
                                                }}
                                                className="group rounded-2xl border border-border/70 bg-background/70 p-6 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-glow"
                                            >
                                                <div className="flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 p-4 text-primary">
                                                    <GraduationCap className="h-10 w-10" />
                                                </div>
                                                <div className="mt-4 text-sm font-semibold text-foreground text-center">
                                                    {t.signup.roleStudentCard}
                                                </div>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    form.setValue('role', 'teacher', { shouldValidate: true })
                                                    setStep('form')
                                                }}
                                                className="group rounded-2xl border border-border/70 bg-background/70 p-6 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-glow"
                                            >
                                                <div className="flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 p-4 text-primary">
                                                    <Presentation className="h-10 w-10" />
                                                </div>
                                                <div className="mt-4 text-sm font-semibold text-foreground text-center">
                                                    {t.signup.roleTeacherCard}
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                    <div
                                        className={`transition-all duration-500 ${step === 'form' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none absolute inset-0'}`}
                                    >
                                        <Form {...form}>
                                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                    <span>{t.signup.roleLabel}: {form.getValues('role') === 'teacher' ? t.signup.roleTeacher : t.signup.roleStudent}</span>
                                                    <button
                                                        type="button"
                                                        className="text-primary hover:underline"
                                                        onClick={() => setStep('role')}
                                                    >
                                                        {t.signup.roleBack}
                                                    </button>
                                                </div>

                                                <FormField
                                                    control={form.control}
                                                    name="email"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-[15px]">{t.signup.email}</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="user@langoer.com"
                                                                    type="email"
                                                                    {...field}
                                                                    disabled={isLoading}
                                                                    className="h-11 bg-muted/50 border-border focus-visible:ring-transparent"
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="password"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-[15px]">{t.signup.password}</FormLabel>
                                                            <FormControl>
                                                                <div className="relative">
                                                                    <Input
                                                                        placeholder="••••••"
                                                                        type={showPassword ? 'text' : 'password'}
                                                                        {...field}
                                                                        disabled={isLoading}
                                                                        className="h-11 pr-10 bg-muted/50 border-border focus-visible:ring-transparent"
                                                                    />

                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setShowPassword(!showPassword)}
                                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                                    >
                                                                        {showPassword ? (
                                                                            <EyeOff className="h-4 w-4" />
                                                                        ) : (
                                                                            <Eye className="h-4 w-4" />
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="confirmPassword"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-[15px]">{t.signup.confirmPassword}</FormLabel>
                                                            <FormControl>
                                                                <div className="relative">
                                                                    <Input
                                                                        placeholder="••••••"
                                                                        type={showConfirmPassword ? 'text' : 'password'}
                                                                        {...field}
                                                                        disabled={isLoading}
                                                                        className="h-11 pr-10 bg-muted/50 border-border focus-visible:ring-transparent"
                                                                    />

                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                                    >
                                                                        {showConfirmPassword ? (
                                                                            <EyeOff className="h-4 w-4" />
                                                                        ) : (
                                                                            <Eye className="h-4 w-4" />
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <Button
                                                    type="submit"
                                                    size="lg"
                                                    className="w-full rounded-lg transition-all bg-gradient-to-br from-primary to-accent text-white shadow-glow hover:shadow-glow hover:brightness-110 hover:scale-[1.02]"
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? t.common.loading : t.signup.signUpButton}
                                                </Button>

                                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                    <div className="h-px flex-1 bg-border" />
                                                    <span>{t.signup.or}</span>
                                                    <div className="h-px flex-1 bg-border" />
                                                </div>

                                                <p className="text-center text-xs text-muted-foreground">
                                                    {t.signup.description}
                                                    <Link href="/login" className="text-primary hover:underline"> {t.signup.signIn} </Link>
                                                </p>
                                            </form>
                                        </Form>
                                    </div>
                                </div>
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

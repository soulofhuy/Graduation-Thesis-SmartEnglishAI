'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createLoginSchema, type LoginFormValues } from '@/lib/validators/login'
import { getAuthValidationMessages } from '@/lib/validation-translators/auth'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageToggle } from '@/components/language-toggle'
import { useLanguage } from '@/components/language-provider'
import { ArrowLeft } from 'lucide-react'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from '@/components/ui/form'
import Image from 'next/image'


export default function LoginPage() {
  const { t, language } = useLanguage()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const loginSchema = useMemo(
    () => createLoginSchema(getAuthValidationMessages(language)),
    [language],
  )

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (values.email.includes('admin')) {
        router.push('/admin/overview')
      } else if (values.email.includes('teacher')) {
        router.push('/teacher/overview')
      } else {
        router.push('/student/overview')
      }

      toast.success('Đăng nhập thành công!')
    } catch (error) {
      toast.error('Đăng nhập thất bại. Vui lòng thử lại.')
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
          <div className="relative z-10 flex items-center py-12">
            <div className={`w-full transition-all duration-700 ${isLoaded ? 'animate-scale-in' : 'opacity-0'}`}>
              <div className="space-y-2">
                <h1 className="text-lg font-semibold tracking-tight sm:text-4xl">{t.login.title}</h1>
              </div>

              <Card className="mt-8 border border-border/70 bg-card/90 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[15px]">{t.login.email}</FormLabel>
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
                          <FormLabel className="text-[15px]">{t.login.password}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="••••••"
                              type="password"
                              {...field}
                              disabled={isLoading}
                              className="h-11 bg-muted/50 border-border focus-visible:ring-transparent"
                            />
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
                      {isLoading ? t.common.loading : t.login.loginButton}
                    </Button>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="h-px flex-1 bg-border" />
                      <span>{t.login.or}</span>
                      <div className="h-px flex-1 bg-border" />
                    </div>

                    <p className="text-center text-xs text-muted-foreground">
                      {t.login.description}
                      <Link href="/signup" className="text-primary hover:underline"> {t.login.signUp} </Link>
                    </p>
                  </form>
                </Form>
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

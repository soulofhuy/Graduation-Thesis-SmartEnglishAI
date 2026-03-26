'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageToggle } from '@/components/language-toggle'
import { useLanguage } from '@/components/language-provider'
import { ArrowLeft } from 'lucide-react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const loginSchema = z.object({
  email: z.string().email('Vui lòng nhập địa chỉ email hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

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
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900" />
      
      {/* Animated background elements */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-primary/15 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="backdrop-blur-sm border-b border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 w-fit hover:opacity-70 transition-smooth text-foreground">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">{t.nav.back}</span>
            </Link>
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
          <div className={`w-full max-w-md transition-all duration-1000 ${isLoaded ? 'animate-scale-in' : 'opacity-0'}`}>
            <Card className="p-8 space-y-8 border-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-2xl">
              {/* Logo */}
              <div className={`text-center space-y-4 transition-all duration-1000 ${isLoaded ? 'animate-fade-in-down' : 'opacity-0'}`}>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold mx-auto shadow-glow">
                  E
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold bg-gradient-text">{t.login.title}</h1>
                  <p className="text-muted-foreground">{t.login.subtitle}</p>
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-medium">{t.login.email}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t.login.email.toLowerCase()}
                            type="email"
                            {...field}
                            disabled={isLoading}
                            className="bg-background/50 border-border/50 focus:border-primary transition-all"
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
                        <FormLabel className="text-foreground font-medium">{t.login.password}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="••••••••"
                            type="password"
                            {...field}
                            disabled={isLoading}
                            className="bg-background/50 border-border/50 focus:border-primary transition-all"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" size="lg" className="w-full shadow-glow hover:shadow-glow hover:scale-105 transition-all" disabled={isLoading}>
                    {isLoading ? t.common.loading : t.login.signInBtn}
                  </Button>
                </form>
              </Form>

              {/* Demo Credentials */}
              <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl p-4 space-y-3 text-sm border border-primary/10">
                <p className="font-semibold text-foreground">{t.login.demoAccounts}</p>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li>
                    <strong>{t.login.admin}:</strong> <span className="font-mono text-foreground">admin@example.com</span> / password
                  </li>
                  <li>
                    <strong>{t.login.teacher}:</strong> <span className="font-mono text-foreground">teacher@example.com</span> / password
                  </li>
                  <li>
                    <strong>{t.login.student}:</strong> <span className="font-mono text-foreground">student@example.com</span> / password
                  </li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

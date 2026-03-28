'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageToggle } from '@/components/language-toggle'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Pencil } from 'lucide-react'
import { useLanguage } from '@/components/language-provider'

const settingsSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  address: z.string().optional(),
  phoneNumber: z.string().optional(),
  dateOfBirth: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  confirmPassword: z.string().optional(),
})

type SettingsFormValues = z.infer<typeof settingsSchema>

export default function StudentSettingsPage() {
  const { t } = useLanguage();
  const [isSaving, setIsSaving] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      firstName: 'Minh',
      lastName: 'Anh',
      address: 'Ho Chi Minh City',
      phoneNumber: '0900000000',
      dateOfBirth: '2002-05-10',
      createdAt: '2024-01-15',
      updatedAt: '2026-03-28',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(values: SettingsFormValues) {
    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success('Lưu cài đặt thành công!')
      if (isEditingProfile) {
        setIsEditingProfile(false)
      }
    } catch (error) {
      toast.error('Lỗi khi lưu cài đặt')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="md:p-8 space-y-8 bg-gradient-to-br from-background via-background to-muted/10">
      <div className="mx-auto w-full space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t.student.settings.title}</h1>
          <p className="text-muted-foreground mt-1">{t.student.settings.description}</p>
        </div>

        <Tabs defaultValue="setting" className="space-y-6">
          <TabsList className="flex flex-wrap justify-start gap-2">
            <TabsTrigger value="setting">{t.student.settings.tabs.settingsTab.mainTitle}</TabsTrigger>
            <TabsTrigger value="profile">{t.student.settings.tabs.profileTab.mainTitle}</TabsTrigger>
            <TabsTrigger value="password">{t.student.settings.tabs.passwordTab.mainTitle}</TabsTrigger>
          </TabsList>

          <TabsContent value="setting" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.student.settings.tabs.settingsTab.subTitle}</CardTitle>
                <CardDescription>{t.student.settings.tabs.settingsTab.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{t.student.settings.tabs.settingsTab.option[0].title}</p>
                    <p className="text-xs text-muted-foreground">{t.student.settings.tabs.settingsTab.option[0].description}</p>
                  </div>
                  <ThemeToggle />
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{t.student.settings.tabs.settingsTab.option[1].title}</p>
                    <p className="text-xs text-muted-foreground">{t.student.settings.tabs.settingsTab.option[1].description}</p>
                  </div>
                  <LanguageToggle />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-1">
                        <CardTitle>{t.student.settings.tabs.profileTab.subTitle}</CardTitle>
                        <CardDescription>{t.student.settings.tabs.profileTab.description}</CardDescription>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditingProfile((prev) => !prev)}
                          className="gap-2"
                        >
                          <Pencil className="h-4 w-4" />
                          {isEditingProfile ? t.common.cancelEditting : t.common.edit}
                        </Button>
                        {isEditingProfile && (
                          <Button type="submit" disabled={isSaving} className="gap-2">
                            {isSaving ? t.common.isSaving : t.common.save}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t.student.settings.tabs.profileTab.fields.firstName}</FormLabel>
                            <FormControl>
                              <Input {...field} readOnly={!isEditingProfile} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t.student.settings.tabs.profileTab.fields.lastName}</FormLabel>
                            <FormControl>
                              <Input {...field} readOnly={!isEditingProfile} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t.student.settings.tabs.profileTab.fields.address}</FormLabel>
                            <FormControl>
                              <Input {...field} readOnly={!isEditingProfile} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t.student.settings.tabs.profileTab.fields.phoneNumber}</FormLabel>
                            <FormControl>
                              <Input {...field} readOnly={!isEditingProfile} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t.student.settings.tabs.profileTab.fields.dateOfBirth}</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} readOnly={!isEditingProfile} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    <div className="grid gap-6 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="createdAt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t.student.settings.tabs.profileTab.fields.createdAt}</FormLabel>
                            <FormControl>
                              <Input {...field} readOnly />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="updatedAt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t.student.settings.tabs.profileTab.fields.updatedAt}</FormLabel>
                            <FormControl>
                              <Input {...field} readOnly />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="password" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t.student.settings.tabs.passwordTab.subTitle}</CardTitle>
                    <CardDescription>{t.student.settings.tabs.passwordTab.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.student.settings.tabs.passwordTab.fields.currentPassword}</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.student.settings.tabs.passwordTab.fields.newPassword}</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
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
                          <FormLabel>{t.student.settings.tabs.passwordTab.fields.confirmPassword}</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="password">
                <Button type="submit" disabled={isSaving} className="w-full">
                  {isSaving ? 'Đang lưu...' : 'Lưu cài đặt'}
                </Button>
              </TabsContent>
            </form>
          </Form>
        </Tabs>
      </div>
    </div>
  )
}
